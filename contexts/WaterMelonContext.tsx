import React, { ReactElement, createContext, useContext } from 'react';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from '@/watermelon/schemas';
import { Goal, Progress } from '@/watermelon/models';
import migrations from '@/watermelon/migrations';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.error(error);
  },
});

const database = new Database({
  adapter,
  modelClasses: [Goal, Progress],
});

const DatabaseContext = createContext<any>(null);

export const DatabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}): ReactElement => {
  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  return useContext(DatabaseContext);
};
