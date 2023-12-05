"use client";

const mqtt = require("mqtt");

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import Config from "./config";
import { MessageCircle } from "lucide-react";

let connection: any = null;
let history: any = [];
let users: any = {};

const UserCard = (props: any) => {
  const inviteToChat = (user: any) => {
    const controlTopic: string = user + "_control";
    console.log(`Sending invite to:`, user);

    let ctrlClient: any = mqtt.connect(Config.brokerUri, {
      clean: Config.cleansession,
      connectTimeout: 5000,
      clientId: new Date().getTime().toString(),
      username: props.username,
      password: null,
      topic: null,
    });

    // connect and subscribe to topic
    ctrlClient?.on("connect", () => {
      ctrlClient?.subscribe(controlTopic, () => {
        ctrlClient.publish(
          controlTopic,
          JSON.stringify({
            type: "chatRequest",
            from: props.username,
            timestamp: new Date().getTime().toString(),
          }),
          { retain: true }
        );
      });
    });
  };

  return (
    <div>
      {Object.keys(users).map((user: any) => (
        <div key={user.id}>
          {props.online && users[user] && (
            <div>
              <Button
                variant={"ghost"}
                className="m-0 p-1"
                disabled={user == props.username}
                onClick={() => {
                  inviteToChat(user);
                }}
              >
                <MessageCircle
                  className="p-0 m-0"
                  style={{ transform: "translateY(25%)" }}
                  size={24}
                  color="#2c5678"
                  strokeWidth={1.25}
                  absoluteStrokeWidth
                />
              </Button>

              <small>
                <span className="text-green-500">Online: </span>
                {user == props.username ? <b>You</b> : user}
              </small>
            </div>
          )}

          {!props.online && !users[user] && (
            <div>
              <Button
                variant={"ghost"}
                className="m-0 p-1"
                disabled={user == props.username}
                onClick={() => {
                  inviteToChat(user);
                }}
              >
                <MessageCircle
                  className="p-0 m-0"
                  style={{ transform: "translateY(25%)" }}
                  size={24}
                  color="#2c5678"
                  strokeWidth={1.25}
                  absoluteStrokeWidth
                />
              </Button>

              <small>
                <span className="text-destructive">Offline: </span>
                {user == props.username ? <b>You</b> : user}
              </small>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const UsersOnline = (props: any) => {
  const [reload, setReload] = useState(false);

  useEffect(() => {
    connection = mqtt.connect(Config.brokerUri, {
      clientId: new Date().getTime(),
      will: {
        topic: Config.usersTopic,
        payload: JSON.stringify({
          username: props.username,
          online: false,
        }),
        qos: 1,
        retain: true,
      },
    });

    connection?.on("connect", () =>
      connection?.subscribe(Config.usersTopic, () => {
        connection.publish(
          Config.usersTopic,
          JSON.stringify({
            username: props.username,
            online: true,
          }),
          { retain: true }
        );
      })
    );

    connection?.on("message", (topic: any, msg: any) => {
      let temp = JSON.parse(msg.toString());
      users[temp.username] = temp.online;
      history.unshift(temp);
    });

    setInterval(() => {
      document.getElementById("reload_btn")?.click();
      setReload(!reload);
    }, 2000);
  }, []);

  return (
    <div className="mx-1 border rounded-lg p-4 h-[240px] overflow-y-scroll">
      <Button
        className="hidden"
        id="reload_btn"
        onClick={() => setReload(!reload)}
      />

      <div className="text-center">
        <p>User list</p>
      </div>

      <UserCard user={users} username={props.username} online={true} />
      <UserCard user={users} username={props.username} online={false} />
    </div>
  );
};

export default UsersOnline;
