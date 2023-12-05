interface IConfig {
  host: string;
  port: number;
  usersTopic: string;
  groupsTopic: string;
  topic: string;
  useTLS: boolean;
  username: string | null;
  password: string | null;
  cleansession: boolean;
  topicSalt: string;
  brokerUri: string;
}

interface IMessage {
  id: number;
  text: string;
  date_sent: Date | string;
  mine: boolean;
  author: string;
  topic: string;
}

interface IOptions {
  clean: boolean;
  connectTimeout: number;
  clientId: string;
  username: null | string;
  password: null | string;
  topic: null | string;
}

interface IUser {
  id: number;
  username: string | null;
  // online or offline
  status: boolean;
}

interface ITopic {
  id: number;
  code: string;
  title: string | null;
}

interface IGroups {
  name: string;
  leader: string;
  members: string[];
}

export type { IMessage, IOptions, IUser, ITopic, IConfig, IGroups };
