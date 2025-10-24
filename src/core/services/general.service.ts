export class GeneralSrvc
{
    public static formatDate(timestamp: number): string
    { return new Date(timestamp).toLocaleString(); }
}