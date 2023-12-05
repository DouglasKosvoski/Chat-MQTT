"use client";

const mqtt = require("mqtt");

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SendHorizontal, XCircle } from "lucide-react";

import { IMessage, IOptions } from "./Interfaces";
import Config from "./config";
import History from "./History";

let client: any = null;
let history: IMessage[] = [];

const Mensager = (props: any) => {
  const [options, setOptions] = useState<IOptions>({
    clean: Config.cleansession,
    connectTimeout: 5000,
    clientId: new Date().getTime().toString(),
    username: props.username,
    password: null,
    topic: props.topic,
  });

  const emptyMessage: IMessage = {
    id: 0,
    author: "",
    text: "",
    date_sent: "",
    mine: false,
    topic: "",
  };

  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState<IMessage>(emptyMessage);

  useEffect(() => {
    setOptions({
      ...options,
      topic: props.topic,
      clientId: new Date().getTime().toString(),
    });
  }, [props.topic]);

  useEffect(() => {
    console.log(`Options changed to ${JSON.stringify(options)}`);
    connectClient();
  }, [options, setOptions]);

  const [ticking, setTicking] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setMessage({ ...message, text: message.text });

    const timer = setTimeout(() => setCount(count + 1), 500);
    return () => clearTimeout(timer);
  }, [count, ticking]);

  const handleSubmit = () => {
    if (!message.text) return;
    if (!client) return alert("Please connect before sending a message");

    client.publish(
      options.topic,
      JSON.stringify({
        ...message,
        author: options.username,
        date_sent: new Date().toISOString(),
      }),
      { retain: true }
    );
    setMessage(emptyMessage);
  };

  const connectClient = () => {
    if (!options.topic) return;

    console.log(`Creating new Connection on ${options.topic}`);
    client = mqtt.connect(Config.brokerUri, options);
    setConnected(true);

    // connect and subscribe to topic
    client?.on("connect", () => {
      client?.subscribe(options.topic);
    });

    // handle incoming messages
    client?.on("message", (topic: any, msg: any) => {
      if (topic != props.topic) {
        console.log(`Mensagem recebida em outro tópico`, topic);
        return;
      }

      let data = null;
      try {
        data = JSON.parse(msg.toString());
      } catch (e) {
        console.log("Could not convert: " + msg.toString());
      }

      if (data) {
        console.log("Message received:", data);
        history.push({
          ...data,
          id: new Date().getTime(),
          topic: topic,
          // topic: topic.replace(Config.topicSalt, ""),
        });
        setTimeout(() => {
          scrollToBottom("content");
        }, 500);
      }
    });

    // handle errors
    client?.on("error", (error: any) => {
      console.log(`error`, error);
      closeConnection();
    });
  };

  const closeConnection = () => {
    console.log("MQTT close connection");
    if (client) {
      client.end();
      client = null;
    }
    setConnected(false);
  };

  const scrollToBottom = (id: string) => {
    document
      ?.getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  return (
    <div>
      <History
        currentTopic={props.topic}
        username={options.username}
        clear={props.clear}
        history={history}
      />
      <div className="gap-2 mt-2 flex">
        <Input
          disabled={!connected || props.topic === "general"}
          type="text"
          placeholder={
            props.topic === "general"
              ? "Select one room/friend to chat with..."
              : "Enter your message"
          }
          value={message.text}
          className="w-full"
          onKeyDown={(k) => {
            if (k.key === "Enter") handleSubmit();
          }}
          onChange={(e: any) =>
            setMessage({ ...message, text: e.target.value })
          }
        />
        <Button
          onClick={handleSubmit}
          disabled={!connected || props.topic === "general"}
          variant={"ghost"}
          size={"sm"}
        >
          {connected ? (
            <SendHorizontal className="text-primary" />
          ) : (
            <XCircle className="text-destructive" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default Mensager;
