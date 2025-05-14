import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import { addNotification } from "./notificationSlice";

export interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  price: number;
  category: string;
  image?: string;
  isBooked?: boolean;
  availableTickets: number;
  organizer?: string;
  contact?: string;
  imgUrl?: string;
  createdBy?: {
    name: string;
    email?: string;
    _id?: string;
  };
}

interface EventState {
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/events");
      return response.data.data.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch events"
      );
    }
  }
);

export const fetchEventById = createAsyncThunk(
  "events/fetchEventById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch event"
      );
    }
  }
);

export const createEvent = createAsyncThunk(
  "event/createEvent",
  async (eventData: FormData, { dispatch }) => {
    const response = await api.post("/events", eventData);
    dispatch(
      addNotification({
        type: "success",
        message: "New event created successfully",
        link: `/admin/events/${response.data._id}`,
      })
    );
    return response.data;
  }
);

export const updateEvent = createAsyncThunk(
  "event/updateEvent",
  async (
    { id, eventData }: { id: string; eventData: FormData },
    { dispatch }
  ) => {
    const response = await api.put(`/events/${id}`, eventData);
    dispatch(
      addNotification({
        type: "info",
        message: "Event updated successfully",
        link: `/admin/events/${id}`,
      })
    );
    return response.data;
  }
);

export const deleteEvent = createAsyncThunk(
  "event/deleteEvent",
  async (id: string, { dispatch }) => {
    await api.delete(`/events/${id}`);
    dispatch(
      addNotification({
        type: "warning",
        message: "Event deleted successfully",
      })
    );
    return id;
  }
);

export const createBooking = createAsyncThunk(
  "event/createBooking",
  async (bookingData: any, { dispatch }) => {
    const response = await api.post("/bookings", bookingData);
    dispatch(
      addNotification({
        type: "success",
        message: "New booking created",
        link: `/admin/bookings/${response.data._id}`,
      })
    );
    return response.data;
  }
);

export const updateBookingStatus = createAsyncThunk(
  "event/updateBookingStatus",
  async ({ id, status }: { id: string; status: string }, { dispatch }) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    dispatch(
      addNotification({
        type: "info",
        message: `Booking status updated to ${status}`,
        link: `/admin/bookings/${id}`,
      })
    );
    return response.data;
  }
);

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })
      // Fetch Event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export const { clearError, clearCurrentEvent } = eventSlice.actions;
export default eventSlice.reducer;
