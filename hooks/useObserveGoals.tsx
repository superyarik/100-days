import { Goal } from '@/watermelon/models';
import { useEffect, useState } from 'react';

const useObserveGoals = (observable: any) => {
  const [value, setValue] = useState<Goal[]>([]);

  useEffect(() => {
    const subscription = observable.observe().subscribe(setValue);

    return () => subscription.unsubscribe();
  }, [observable]);

  return value;
};

export default useObserveGoals;
