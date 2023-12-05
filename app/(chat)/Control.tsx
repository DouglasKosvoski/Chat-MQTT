"use client";

const mqtt = require("mqtt");

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import Config from "./config";

let connection: any = null;
let invitations: any = [];

const Control = (props: any) => {
  const [reload, setReload] = useState(false);
  const controlTopic: string = props.username + "_control";

  const [count, setCount] = useState(0);

  useEffect(() => {
    connection = mqtt.connect(Config.brokerUri, {
      clientId: new Date().getTime(),
    });

    connection?.on("connect", () =>
      connection?.subscribe(controlTopic, () => {
        console.log(`Connected to server: ${controlTopic}`);
      })
    );
  }, []);

  useEffect(() => {
    // solicitations arrive here
    connection?.on("message", (topic: any, msg: any) => {
      let data: any = null;
      try {
        data = JSON.parse(msg.toString());
      } catch (e) {
        console.log("Could not convert: " + msg.toString());
      }

      console.log("Control - Message received:", data, topic);
      if (!data.accept) {
        if (!checkIfMessageAlreadyExists(invitations, data)) {
          console.log(`Message is new`);
          invitations.unshift({
            ...data,
          });
        } else {
          console.log(`Message already received`);
        }
      } else {
        console.log(`Invitation accepted from user: ${data.from}`);
        console.log(`New main topic is: ${data.newTopic}`);
        props.changeTopicFunc(data.newTopic);
      }
    });

    document.getElementById("reload_btn_ctrl")?.click();
    setReload(!reload);

    const timer = setTimeout(() => setCount(count + 1), 1000);
    return () => clearTimeout(timer);
  }, [count, setCount]);

  const checkIfMessageAlreadyExists = (messageArray: any, data: any) => {
    let found: boolean = false;

    messageArray.map((msg: any) => {
      if (msg.from === data.from) {
        if (msg.type === data.type) {
          found = true;
        }
      }
    });

    return found;
  };

  const removePreviousInvites = (inviteToRemove: any) => {
    let temp: any = [];
    invitations.forEach((invite: any) => {
      if (
        invite.from == inviteToRemove.from &&
        invite.type === inviteToRemove.type
      ) {
        console.log("removing all invites from", invite);
      } else {
        temp.push(invite);
      }
    });
    invitations = temp;
  };

  const acceptInvite = (invite: any) => {
    const user: any = invite.from;
    const controlTopic: string = invite.from + "_control";

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
      console.log(`connected`);

      // !todo: check if invite is o type chatRequest before creating a new channel
      // if type is joinRequest allow into members and comunnicate to GROUPS

      if (invite.type === "chatRequest") {
        ctrlClient?.subscribe(controlTopic, () => {
          console.log(`subscribed to`, controlTopic);
          const newTopic: string = props.username + "_" + invite.from;

          ctrlClient.publish(
            controlTopic,
            JSON.stringify({
              accept: true,
              newTopic: newTopic,
              from: props.username,
              timestamp: new Date().getTime().toString(),
            }),
            { retain: true }
          );

          props.changeTopicFunc(newTopic);
        });
      } else if (invite.type === "joinRequest") {
        ctrlClient?.subscribe(Config.groupsTopic, () => {
          console.log(`subscribed to`, Config.groupsTopic);
          ctrlClient.publish(
            Config.groupsTopic,
            JSON.stringify({
              type: "newMember",
              groupName: invite.groupName,
              memberName: invite.from,
              from: props.username,
              timestamp: new Date().getTime().toString(),
            })
          );
        });
      }
    });

    removePreviousInvites(invite);
  };

  return (
    <div>
      <Button
        className="hidden"
        id="reload_btn_ctrl"
        onClick={() => setReload(!reload)}
      />
      <div className="mx-1 border rounded-lg p-4 h-[495px] overflow-y-scroll">
        <div className="text-center">
          <p>Solicitations</p>
          {invitations?.map((invite: any) => (
            <div
              key={invite}
              className="flex w-full max-w-sm items-center mt-1 space-x-1"
            >
              {invite?.type === "joinRequest" ? (
                <Button size={"sm"} onClick={() => acceptInvite(invite)}>
                  Allow {invite?.from} in {invite?.groupName}?
                </Button>
              ) : (
                <Button size={"sm"} onClick={() => acceptInvite(invite)}>
                  Chat with {invite?.from}
                </Button>
              )}
            </div>
          ))}

          {!invitations?.length && <small>No invites at this moment</small>}
        </div>
      </div>
    </div>
  );
};

export default Control;
