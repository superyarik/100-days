# 100 Days

Released to the Google Play store and iOS App Store as Hundred Habits.

A React Native mobile app that helps you get better at a task / develop a habit with the Law of 100 principle.

The Law of 100 is a commitment to a task or goal for 100 iterations or days. It's about doing something consistently, without fail, 100 times. This approach taps into the power of habit formation and perseverance. It's not just about reaching a numerical milestone; it's about the journey and transformation that occurs along the way.

## Data Persistence

[WatermelonDB](<[https://](https://github.com/Nozbe/WatermelonDB)https://github.com/Nozbe/WatermelonDB>)

All data is stored locally in a SQLite database and components are built to observe changes to the database.

## DB Migration Steps

### Migrations workflow

When you make schema changes when you use migrations, be sure to do this in this specific order, to minimize the likelihood of making an error.

### Step 1: Add a new migration

First, define the migration - that is, define the change that occurs between two versions of schema (such as adding a new table, or a new table column).

Don't change the schema file yet!

```javascript
// app/model/migrations.js

import {
  schemaMigrations,
  createTable,
} from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      // ⚠️ Set this to a number one larger than the current schema version
      toVersion: 2,
      steps: [
        // See "Migrations API" for more details
        createTable({
          name: 'comments',
          columns: [
            { name: 'post_id', type: 'string', isIndexed: true },
            { name: 'body', type: 'string' },
          ],
        }),
      ],
    },
  ],
});
```

Refresh your simulator/browser. You should see this error:

> Migrations can't be newer than schema. Schema is version 1 and migrations cover range from 1 to 2

If so, good, move to the next step!

But you might also see an error like "Missing table name in schema", which means you made an error in defining migrations. See "Migrations API" below for details.

### Step 2: Make matching changes in schema

Now it's time to make the actual changes to the schema file — add the same tables or columns as in your migration definition

⚠️ Please double and triple check that your changes to schema match exactly the change you defined in the migration. Otherwise you risk that the app will work when the user migrates, but will fail if it's a fresh install — or vice versa.

⚠️ Don't change the schema version yet

```javascript
// model/schema.js

export default appSchema({
  version: 1,
  tables: [
    // This is our new table!
    tableSchema({
      name: 'comments',
      columns: [
        { name: 'post_id', type: 'string', isIndexed: true },
        { name: 'body', type: 'string' },
      ],
    }),
    // ...
  ],
});
```

Refresh the simulator. You should again see the same "Migrations can't be newer than schema" error. If you see a different error, you made a syntax error.

### Step 3: Bump schema version

Now that we made matching changes in the schema (source of truth about tables and columns) and migrations (the change in tables and columns), it's time to commit the change by bumping the version:

```javascript
// model/schema.js

export default appSchema({
  version: 2,
  tables: [
    // ...
  ],
});
```

If you refresh again, your app should show up without issues — but now you can use the new tables/columns

### Step 4: Test your migrations

Before shipping a new version of the app, please check that your database changes are all compatible:

1. Migrations test: Install the previous version of your app, then update to the version you're about to ship, and make sure it still works
2. Fresh schema install test: Remove the app, and then install the new version of the app, and make sure it works

### Why is this order important

It's simply because React Native simulator (and often React web projects) are configured to automatically refresh when you save a file. You don't want to database to accidentally migrate (upgrade) with changes that have a mistake, or changes you haven't yet completed making. By making migrations first, and bumping version last, you can double check you haven't made a mistake.

### Migrations API

Each migration must migrate to a version one above the previous migration, and have multiple steps (such as adding a new table, or new columns). Larger example:

```javascript
schemaMigrations({
  migrations: [
    {
      toVersion: 3,
      steps: [
        createTable({
          name: 'comments',
          columns: [
            { name: 'post_id', type: 'string', isIndexed: true },
            { name: 'body', type: 'string' },
          ],
        }),
        addColumns({
          table: 'posts',
          columns: [
            { name: 'subtitle', type: 'string', isOptional: true },
            { name: 'is_pinned', type: 'boolean' },
          ],
        }),
      ],
    },
    {
      toVersion: 2,
      steps: [
        // ...
      ],
    },
  ],
});
```

### Migration steps:

- `createTable({ name: 'table_name', columns: [ ... ] })` - same API as tableSchema()
- `addColumns({ table: 'table_name', columns: [ ... ] })` - you can add one or multiple columns to an existing table. The columns table has the same format as in schema definitions
- Other types of migrations (e.g. deleting or renaming tables and columns) are not yet implemented. See migrations/index.js. Please contribute!

## Running

- `bun i` from the root
- `npx expo prebuild`
- `bun run ios` or `bun run android`
