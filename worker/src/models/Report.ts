import { DataTypes, Model } from 'sequelize';
import { getDatabase } from '@report-generator/shared';
import { ReportStatus } from '@report-generator/shared';

export class Report extends Model {
  declare id: string;
  declare name: string;
  declare requestedBy: string;
  declare status: ReportStatus;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare completedAt?: Date;
  declare errorMessage?: string;
}

export function initializeReportModel() {
  Report.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      requestedBy: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Anonymous',
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize: getDatabase(),
      modelName: 'Report',
      tableName: 'reports',
      timestamps: true,
    }
  );
}

export default Report;

