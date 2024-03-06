import { Model } from '@nozbe/watermelondb';
import {
  children,
  date,
  field,
  readonly,
  text,
} from '@nozbe/watermelondb/decorators';

// @ts-ignore
export class Goal extends Model {
  static table = 'goals';
  static associations = {
    progresses: { type: 'has_many', foreignKey: 'goal_id' },
  };

  // @ts-ignore
  @text('title') title: string;

  // @ts-ignore
  @text('description') description: string;

  // @ts-ignore
  @text('status') status: string;

  // @ts-ignore
  @text('notification_id') notificationId: string;

  // @ts-ignore
  @field('notification_hour') notificationHour: number;

  // @ts-ignore
  @readonly @date('created_at') createdAt;
  // @ts-ignore
  @readonly @date('updated_at') updatedAt;

  // @ts-ignore
  @children('progresses') progresses;
}
