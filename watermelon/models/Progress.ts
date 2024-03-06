import { Model } from '@nozbe/watermelondb';
import { field, relation, text } from '@nozbe/watermelondb/decorators';

export class Progress extends Model {
  static table = 'progresses';

  // @ts-ignore
  @text('description') description;

  // @ts-ignore
  @relation('goals', 'goal_id') goal;

  // @ts-ignore
  @field('last_logged_at') lastLoggedAt;

  // @ts-ignore
  @field('cell_number') cellNumber;
}
