/*
 * File        : menu-item.util.ts
 * Description : Menu item utility is used in the list of "sidebar" page.
 * Author      : Kuts Vladyslav Ivanovich
 */
export interface MenuItem
{
  title: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
}