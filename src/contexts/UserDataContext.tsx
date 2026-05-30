import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserData, MacroTargets, WeightLossProjection } from '../lib/calculations';

interface UserDataState {
  userData: UserData | null;
  macroTargets: MacroTargets | null;
  weightLossProjection: WeightLossProjection | null;
  isDataComplete: boolean;
}

type UserDataAction =
  | { type: 'SET_USER_DATA'; payload: UserData }
  | { type: 'SET_MACRO_TARGETS'; payload: MacroTargets }
  | { type: 'SET_WEIGHT_LOSS_PROJECTION'; payload: WeightLossProjection }
  | { type: 'CLEAR_DATA' }
  | { type: 'LOAD_FROM_STORAGE'; payload: UserDataState };

const initialState: UserDataState = {
  userData: null,
  macroTargets: null,
  weightLossProjection: null,
  isDataComplete: false,
};

function userDataReducer(state: UserDataState, action: UserDataAction): UserDataState {
  switch (action.type) {
    case 'SET_USER_DATA':
      return {
        ...state,
        userData: action.payload,
        isDataComplete: true,
      };
    case 'SET_MACRO_TARGETS':
      return {
        ...state,
        macroTargets: action.payload,
      };
    case 'SET_WEIGHT_LOSS_PROJECTION':
      return {
        ...state,
        weightLossProjection: action.payload,
      };
    case 'CLEAR_DATA':
      return initialState;
    case 'LOAD_FROM_STORAGE':
      return action.payload;
    default:
      return state;
  }
}

interface UserDataContextType {
  state: UserDataState;
  setUserData: (userData: UserData) => void;
  setMacroTargets: (macroTargets: MacroTargets) => void;
  setWeightLossProjection: (projection: WeightLossProjection) => void;
  clearData: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userDataReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('keto-planner-user-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedData });
      } catch (error) {
        console.error('Failed to load user data from storage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (state.userData) {
      localStorage.setItem('keto-planner-user-data', JSON.stringify(state));
    }
  }, [state]);

  const setUserData = (userData: UserData) => {
    dispatch({ type: 'SET_USER_DATA', payload: userData });
  };

  const setMacroTargets = (macroTargets: MacroTargets) => {
    dispatch({ type: 'SET_MACRO_TARGETS', payload: macroTargets });
  };

  const setWeightLossProjection = (projection: WeightLossProjection) => {
    dispatch({ type: 'SET_WEIGHT_LOSS_PROJECTION', payload: projection });
  };

  const clearData = () => {
    localStorage.removeItem('keto-planner-user-data');
    dispatch({ type: 'CLEAR_DATA' });
  };

  const value: UserDataContextType = {
    state,
    setUserData,
    setMacroTargets,
    setWeightLossProjection,
    clearData,
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
