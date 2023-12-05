"use client";

import { useState } from "react";

import Users from "./Users";
import Control from "./Control";
import Mensager from "./Mensager";
import Groups from "./Groups";

import { Input } from "@/components/ui/input";

const ChatMQTT = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(true);
  const [clearSignal, setClearSignal] = useState<boolean>(true);
  const [topic, setTopic] = useState<string>("general");
  const [info, setInfo] = useState({
    username: "",
  });

  const changeTopic = (topic: string) => {
    console.log(`Switching main topic to: ${topic}`);
    setTopic(topic);
    setClearSignal(!clearSignal);
  };

  return (
    <div className="text-center">
      {modalOpen && (
        <div className="mt-[15vh] text-center w-[60vw] max-w-lg ml-[50%] translate-x-[-50%]">
          <Input
            className="w-full shadow-md"
            type="text"
            value={info.username}
            autoFocus
            placeholder="Enter your name"
            onKeyDown={(k) => {
              if (k.key === "Enter" && info.username) setModalOpen(false);
            }}
            onChange={(e: any) =>
              setInfo({ ...info, username: e.target.value })
            }
          />
        </div>
      )}

      {info.username && !modalOpen && (
        <div className="grid grid-cols-4 gap-1 h-full">
          {/* title */}
          <div className="col-span-4 text-center justify-center h-16">
            <p className="text-4xl py-4">Chat MQTT</p>
          </div>

          <div className="col-span-1 h-[50vh]">
            <Users username={info.username} />
            <Groups changeTopicFunc={changeTopic} username={info.username} />
          </div>

          <div className="col-span-2 h-[50vh]">
            <Mensager
              changeTopicFunc={changeTopic}
              topic={topic}
              username={info.username}
              clear={clearSignal}
            />
          </div>
          <div className="col-span-1 h-[50vh]">
            <Control
              changeTopicFunc={changeTopic}
              topic={topic}
              username={info.username}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMQTT;
