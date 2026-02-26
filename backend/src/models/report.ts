import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { getDatabase } from '@report-generator/shared';

export class Report extends Model<InferAttributes<Report>, InferCreationAttributes<Report>> {

  declare id: CreationOptional<string>;
  declare name: string;
  declare requestedBy: string;
  declare status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare completedAt?: Date | null;
  declare errorMessage?: string | null;
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
        validate: {
          notEmpty: true,
        },
      },
      requestedBy: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
        defaultValue: 'PENDING',
        allowNull: false,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize: getDatabase(),
      modelName: 'Report',
      tableName: 'reports',
      timestamps: true,
    }
  );
}

