import { Model } from 'sequelize-typescript';
declare class WeeklyClosing extends Model {
    barber: string;
    totalGross: number;
    commission: number;
    servicesCount: number;
    archivedServiceIds: string;
}
export default WeeklyClosing;
