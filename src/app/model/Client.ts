import { Roles } from "./Roles";

export class Client{
  id!: number;
  name!: string;
  username!: string;//it is user email
  phoneNumber!: string;
  address!: string;
  country!: string;
  zipCode!: string;
  password!: string;
  roles: Roles[] = [];
}