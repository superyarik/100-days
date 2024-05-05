import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 10,
  tables: [
    tableSchema({
      name: 'user_profiles',
      columns: [{ name: 'locale', type: 'string', isOptional: true }],
    }),
    tableSchema({
      name: 'goals',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'notification_id', type: 'string', isOptional: true },
        { name: 'notification_hour', type: 'number', isOptional: true },
        { name: 'hard_mode', type: 'boolean', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'progresses',
      columns: [
        { name: 'goal_id', type: 'string', isIndexed: true },
        { name: 'description', type: 'string' },
        { name: 'last_logged_at', type: 'number' },
        { name: 'cell_number', type: 'number' },
      ],
    }),
  ],
});
