"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users } from "lucide-react";
import { IGroups } from "./Interfaces";
import { useEffect, useState } from "react";
import Config from "./config";

const mqtt = require("mqtt");
let groupConnection: any = null;

let groups: IGroups[] = [];

const Groups = (props: any) => {
  const [reload, setReload] = useState(false);
  const [newGroup, setNewGroup] = useState<IGroups>({
    name: "",
    leader: props.username,
    members: [],
  });

  const checkIfGroupExists = (groupToSearch: IGroups) => {
    let found: boolean = false;
    groups.map((group: IGroups) => {
      if (group.name === groupToSearch.name) found = true;
    });

    return found;
  };

  const checkGroupLeader = (username: string, group: IGroups) => {
    return group.leader === username;
  };

  // connect to leader_control and send solicitation
  const requestToJoinGroup = async (username: string, group: IGroups) => {
    const leaderTopic: string = "" + group.leader + "_control";
    console.log(`Requesting to join group ${JSON.stringify(group)}`);

    // create a temp connection
    let tempConnection: any = await mqtt.connect(Config.brokerUri, {
      clean: true,
      connectTimeout: 5000,
      clientId: new Date().getTime().toString(),
      username: props.username,
      password: null,
      topic: null,
    });

    console.log(`leaderTopic`, leaderTopic);

    await tempConnection?.on("connect", () => {
      console.log(`connected`);

      // subscribe to leader_control
      tempConnection?.subscribe(leaderTopic, async () => {
        console.log(`subscribed to`, leaderTopic);

        // publish request to leader_control
        await tempConnection.publish(
          leaderTopic,
          JSON.stringify({
            groupName: group.name,
            type: "joinRequest",
            from: props.username,
            timestamp: new Date().getTime().toString(),
          }),
          { qos: 2, retain: false },
          (err: any) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Request sent!");
            }
          }
        );
      });
    });

    // end temp connection
    alert(`Invite to join group: ${group.name} sent to ${group.leader}!`);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    await tempConnection.end();
  };

  const joinGroup = async (group: IGroups) => {
    if (checkGroupLeader(props.username, group)) {
      // I am the leader, switch channel instead
      console.log(`You are the leader of this group ${group.name}`);
      return props.changeTopicFunc(group.name);
    }

    if (checkIfGroupMember(props.username, group)) {
      return props.changeTopicFunc(group.name);
    }

    await requestToJoinGroup(props.username, group);
  };

  const checkIfGroupMember = (username: string, group: IGroups) => {
    if (!group.members.length) return false;

    return group.members.includes(username);
  };

  const createGroup = (newGroup: IGroups) => {
    if (!newGroup.name) return;
    console.log(`Creating group ${JSON.stringify(newGroup)}`);

    if (checkIfGroupExists(newGroup)) {
      alert("Group already exists, asking to join instead.");
      requestToJoinGroup(props.username, newGroup);
      return;
    }

    groupConnection.publish(Config.groupsTopic, JSON.stringify(newGroup), {
      retain: true,
    });

    setNewGroup({ ...newGroup, name: "" });

    return alert("Group created successfully.");
  };

  useEffect(() => {
    groupConnection = mqtt.connect(Config.brokerUri, {
      clientId: new Date().getTime(),
    });

    groupConnection?.on("connect", () =>
      groupConnection?.subscribe(Config.groupsTopic, () => {
        console.log(`Groups Topic subscribed`);
      })
    );

    groupConnection?.on("message", (topic: any, msg: IGroups) => {
      if (topic === Config.groupsTopic) {
        let temp: any = JSON.parse(msg.toString());
        console.log(`Groups Received`, temp);

        if (temp.type === "newMember") {
          // procura qual grupo é e atualiza
          groups.map((group: IGroups) => {
            if (group.name === temp.groupName) {
              group.members.push(temp.memberName);
            }
          });
        } else {
          groups.unshift(temp);
        }
      }
    });

    setInterval(() => {
      document.getElementById("reload_btn_groups")?.click();
      setReload(!reload);
    }, 2000);
  }, []);

  return (
    <div className="mt-2 mx-1 border rounded-lg p-4 h-[250px] overflow-y-scroll">
      <Button
        className="hidden"
        id="reload_btn_groups"
        onClick={() => setReload(!reload)}
      />

      <div className="text-center">
        <p>Groups</p>

        <div className="flex w-full max-w-sm items-center mt-2">
          <Input
            type="text"
            placeholder="Group name"
            className="h-8"
            value={newGroup.name}
            onChange={(e: any) => {
              setNewGroup({ ...newGroup, name: e.target.value });
            }}
            onKeyDown={(k) => {
              if (k.key === "Enter" && newGroup.name) createGroup(newGroup);
            }}
          />
          <Button
            size={"sm"}
            variant={"ghost"}
            className="transform: scale-75"
            style={{ color: `${newGroup.name === "" ? "red" : "green"}` }}
            onClick={() => createGroup(newGroup)}
            disabled={newGroup.name === ""}
          >
            <Plus />
          </Button>
        </div>

        <div className="mt-2">
          {groups?.map((group: any) => (
            <div
              key={group.name}
              className="flex w-full max-w-sm items-center mt-1 space-x-2"
            >
              <Button
                className="h-7 w-12"
                size={"sm"}
                onClick={() => joinGroup(group)}
              >
                Join
              </Button>
              <small>
                {group.name}
                <i>
                  ({group.leader === props.username ? "you" : group.leader})
                </i>
                <Button
                  variant={"ghost"}
                  onClick={() =>
                    alert(
                      `Leader: '${group.leader}'\nMembers: ${JSON.stringify(
                        group.members
                      )}`
                    )
                  }
                >
                  <Users />
                </Button>
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Groups;
