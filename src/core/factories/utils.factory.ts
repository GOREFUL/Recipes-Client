/*
 * File        : utils.factory.ts
 * Description : Main factory of all utils.
 * Author      : Kuts Vladyslav Ivanovich
 */

import { Credentials } from "../utils/credentials.util";
import { MenuItem } from "../utils/menu-item.util";

export class UtilsFactory
{
    public static createCredentials(email: string = "", password: string = ""): Credentials
    { return { email: email, password: password } }

    public static createMenuItem(title: string = "", icon: string ="", route?: string, children?: MenuItem[]): MenuItem
    { return { title: title, icon: icon, route: route, children: children } }
}