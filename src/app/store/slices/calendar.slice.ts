import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DynamicDates, IDnd, IHolidays, ITask } from 'shared/types';
import { format } from 'date-fns';
import { v4 } from 'uuid';
import { holidaysThunk } from '../thunk';

interface IState {
  holidays: IHolidays[];
  selectedDate: string | null;
  showModal: boolean;
  today: string | null;
  tasks: DynamicDates;
  task: string;
  taskId: string | null;
  label: string[];
  colorFilter: { date: string; color: string }[];
  filterText: string;
}

const initialState: IState = {
  holidays: [],
  selectedDate: null,
  showModal: false,
  today: null,
  tasks: {},
  task: '',
  taskId: null,
  label: [],
  colorFilter: [],
  filterText: '',
};
export const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    changeFilterText(state: IState, action: PayloadAction<string>) {
      state.filterText = action.payload;
    },
    loadTasks(state: IState, action: PayloadAction<DynamicDates>) {
      state.tasks = action.payload;
    },
    addColorFilter(state: IState, action: PayloadAction<{ date: string; color: string }>) {
      if (action.payload.color === '') {
        state.colorFilter = [...state.colorFilter].filter((el) => el.date !== action.payload.date);
      } else {
        state.colorFilter = [...state.colorFilter, action.payload];
      }
    },
    dragAndDrop(state: IState, action: PayloadAction<IDnd>) {
      const addElementsToTheDifferentCell = (
        from: ITask[],
        to: ITask[],
        srcIndex: number,
        destIndex: number
      ) => {
        const elementFrom = from[srcIndex];
        to.splice(destIndex, 0, elementFrom);
      };
      const swapElementsFromTheSameCell = (arr: ITask[], srcIndex: number, destIndex: number) => {
        const element = arr[srcIndex];
        arr.splice(srcIndex, 1);
        arr.splice(destIndex, 0, element);
      };
      if (action.payload.destination === action.payload.source) {
        swapElementsFromTheSameCell(
          state.tasks[action.payload.source],
          action.payload.sourceIndex,
          action.payload.destinationIndex
        );
        state.tasks = {
          ...state.tasks,
          [action.payload.source]: [...state.tasks[action.payload.source]],
        };
      } else {
        if (!state.tasks[action.payload.destination]) {
          state.tasks = {
            ...state.tasks,
            [action.payload.destination]: [],
          };
        }
        addElementsToTheDifferentCell(
          state.tasks[action.payload.source],
          state.tasks[action.payload.destination],
          action.payload.sourceIndex,
          action.payload.destinationIndex
        );
        state.tasks = {
          ...state.tasks,
          [action.payload.source]: [
            ...state.tasks[action.payload.source].filter(
              (el, i) => i !== action.payload.sourceIndex
            ),
          ],
          [action.payload.destination]: [...state.tasks[action.payload.destination]],
        };
        if (![...state.tasks[action.payload.source]].length) {
          delete state.tasks[action.payload.source];
        }
      }
    },
    handleSetToday(state: IState) {
      state.today = format(new Date(), 'yyyy-MM-dd');
      state.selectedDate = format(new Date(), 'yyyy-MM-dd');
    },
    selectDate(state: IState, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    showModalWindow(
      state: IState,
      action: PayloadAction<{ show: boolean; task: string; taskId: string | null; label: string[] }>
    ) {
      state.showModal = action.payload.show;
      state.task = action.payload.task;
      state.taskId = action.payload.taskId;
      state.label = action.payload.label;
    },
    addTask(
      state: IState,
      action: PayloadAction<{
        date: string | null;
        task: { text: string; id: string | null; label: string[] };
      }>
    ) {
      const validDate = () => {
        return action.payload.date ? new Date(action.payload.date) : new Date();
      };
      if (state.tasks[format(validDate(), 'yyyy-MM-dd')] && action.payload.task.id) {
        state.tasks = {
          ...state.tasks,
          [format(validDate(), 'yyyy-MM-dd')]: [
            ...state.tasks[format(validDate(), 'yyyy-MM-dd')].map((el) => {
              if (el.id === action.payload.task.id) {
                return {
                  id: action.payload.task.id,
                  task: action.payload.task.text,
                  label: action.payload.task.label,
                };
              }
              return el;
            }),
          ],
        };
      } else if (state.tasks[format(validDate(), 'yyyy-MM-dd')]) {
        state.tasks = {
          ...state.tasks,
          [format(validDate(), 'yyyy-MM-dd')]: [
            ...state.tasks[format(validDate(), 'yyyy-MM-dd')],
            { id: v4(), task: action.payload.task.text, label: action.payload.task.label },
          ],
        };
      } else {
        state.tasks = {
          ...state.tasks,
          [format(validDate(), 'yyyy-MM-dd')]: [
            {
              id: v4(),
              task: action.payload.task.text,
              label: action.payload.task.label,
            },
          ],
        };
      }
    },
    removeTask(state: IState, action: PayloadAction<{ date: string; id: string }>) {
      state.tasks = {
        ...state.tasks,
        [action.payload.date]: [...state.tasks[action.payload.date]].filter(
          (el) => el.id !== action.payload.id
        ),
      };
      if (![...state.tasks[action.payload.date]].length) {
        delete state.tasks[action.payload.date];
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(holidaysThunk.fulfilled, (state: IState, action) => {
      state.holidays = action.payload;
    });
  },
});

export const {
  handleSetToday,
  selectDate,
  showModalWindow,
  addTask,
  removeTask,
  dragAndDrop,
  addColorFilter,
  loadTasks,
  changeFilterText,
} = calendarSlice.actions;
export const CalendarReducer = calendarSlice.reducer;
