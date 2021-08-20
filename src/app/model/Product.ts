import { Category } from './Category';

export class Product {
    idproduct!: any;
    name!: string;
    price!: number;
    description!: string;
    photoname!: string;
    promotion!: boolean;
    selected!: boolean;
    avaible!: boolean;
    category: any;
    quantite!: number;
}