import { IConfig } from "./Interfaces";

const Config: IConfig = {
  host: "127.0.0.1",
  usersTopic: "USERS",
  groupsTopic: "GROUPS",
  port: 9001,
  topic: "_",
  useTLS: false,
  username: null,
  password: null,
  cleansession: false,
  topicSalt: "_777",
  // public paho broker
  brokerUri: "ws://broker.emqx.io:8083/mqtt",
};

export default Config;
