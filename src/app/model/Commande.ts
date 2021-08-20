import { Client } from "./Client";
import { Payment } from "./Payment";
import { ProductItem } from "./ProductItem";

export class Commande{
    id! : number;
    productItems : Array<ProductItem> =[];
    date! : Date;
    client! : Client;
    payment! : Payment
}