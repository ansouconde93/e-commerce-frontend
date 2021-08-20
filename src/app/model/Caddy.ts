import { Client } from "./Client";
import { ProductItem } from "./ProductItem";

export class Caddy{
    name!: String;
    items: Map<number,ProductItem> = new Map();
    client!: Client;
    paied: boolean = false;
}