export type User = {
  username: string;
  id: string;
  age: number;
  hobbies: string[];
};

export type UserRequestBody = {
  username?: string;
  age?: number;
  hobbies?: string[];
};