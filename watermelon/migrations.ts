import {
  addColumns,
  createTable,
  schemaMigrations,
} from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 9,
      steps: [
        createTable({
          name: 'user_profiles',
          columns: [{ name: 'locale', type: 'string', isOptional: true }],
        }),
      ],
    },
    {
      toVersion: 8,
      steps: [
        addColumns({
          table: 'goals',
          columns: [{ name: 'notification_hour', type: 'number' }],
        }),
      ],
    },
    {
      toVersion: 7,
      steps: [
        addColumns({
          table: 'goals',
          columns: [{ name: 'notification_id', type: 'string' }],
        }),
      ],
    },
    {
      toVersion: 6,
      steps: [
        addColumns({
          table: 'progresses',
          columns: [{ name: 'description', type: 'string' }],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        addColumns({
          table: 'progresses',
          columns: [{ name: 'cell_number', type: 'number' }],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        {
          type: 'sql',
          sql: 'ALTER TABLE progress RENAME TO progresses;',
        },
      ],
    },
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'goals',
          columns: [{ name: 'updated_at', type: 'number' }],
        }),
      ],
    },
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'goals',
          columns: [{ name: 'created_at', type: 'number' }],
        }),
      ],
    },
  ],
});
