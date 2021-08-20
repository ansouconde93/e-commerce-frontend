import { Commande } from "./Commande";

export class Payment{
    id!:number;
    date!: Date;
    cardNumber! :string;
    cardType!:string;
    cardPassword! : string;
    amount! : number;
    order! :Commande;
}