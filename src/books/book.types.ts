import { User } from "../user/user.types";

export interface Book {
  _id: string;
  title: string;
  author: User;
  genre: string;
  coverImage: string;
  file: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
