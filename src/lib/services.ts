import { supabase } from './supabase';

export interface CoupleSettings {
  id: string;
  start_date: string;
  created_at: string;
  updated_at: string;
}

export interface DailyRecord {
  id: string;
  author: string;
  title: string;
  content: string;
  images: string[];
  location: string;
  weather?: string;
  mood?: string;
  likes?: number;
  liked?: boolean;
  date: string;
  created_at: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  record_id: string;
  author: string;
  content: string;
  parent_id?: string;
  created_at: string;
}

export interface Anniversary {
  id: string;
  title: string;
  date: string;
  description?: string;
  is_annual: boolean;
  icon_key?: string;
  color?: string;
  created_at: string;
}

export interface Wish {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: 'pending' | 'completed';
  target_date?: string;
  created_at: string;
  completed_at?: string;
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  cover_photo_id?: string;
  color: string;
  created_at: string;
}

export interface Photo {
  id: string;
  album_id: string;
  url: string;
  caption?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  title: string;
  date: string;
  note?: string;
  location?: string;
  image?: string;
  completed: boolean;
  tag_id?: string;
  created_at: string;
}

export interface Checkin {
  id: string;
  name: string;
  tag_id: string;
  date: string;
  location?: string;
  rating: number;
  review?: string;
  created_at: string;
}

export const coupleSettingsService = {
  async get(): Promise<CoupleSettings | null> {
    const { data, error } = await supabase
      .from('couple_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) return null;
    return data;
  },

  async update(id: string, startDate: string): Promise<CoupleSettings> {
    const { data, error } = await supabase
      .from('couple_settings')
      .update({ start_date: startDate, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(startDate: string): Promise<CoupleSettings> {
    const { data, error } = await supabase
      .from('couple_settings')
      .insert({ start_date: startDate })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

export const dailyRecordsService = {
  async getAll(): Promise<DailyRecord[]> {
    const { data, error } = await supabase
      .from('daily_records')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(record: Omit<DailyRecord, 'id' | 'created_at' | 'updated_at'>): Promise<DailyRecord> {
    const { data, error } = await supabase
      .from('daily_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, record: Partial<DailyRecord>): Promise<DailyRecord> {
    const { data, error } = await supabase
      .from('daily_records')
      .update({ ...record, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('daily_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const commentsService = {
  async getByRecordId(recordId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('record_id', recordId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const anniversariesService = {
  async getAll(): Promise<Anniversary[]> {
    const { data, error } = await supabase
      .from('anniversaries')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(anniversary: Omit<Anniversary, 'id' | 'created_at'>): Promise<Anniversary> {
    const { data, error } = await supabase
      .from('anniversaries')
      .insert(anniversary)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, anniversary: Partial<Anniversary>): Promise<Anniversary> {
    const { data, error } = await supabase
      .from('anniversaries')
      .update(anniversary)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('anniversaries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const wishesService = {
  async getAll(): Promise<Wish[]> {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(wish: Omit<Wish, 'id' | 'created_at' | 'completed_at'>): Promise<Wish> {
    const { data, error } = await supabase
      .from('wishes')
      .insert(wish)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async toggleComplete(id: string, completed: boolean): Promise<Wish> {
    const { data, error } = await supabase
      .from('wishes')
      .update({ 
        status: completed ? 'completed' : 'pending',
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('wishes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const albumsService = {
  async getAll(): Promise<Album[]> {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(album: Omit<Album, 'id' | 'created_at'>): Promise<Album> {
    const { data, error } = await supabase
      .from('albums')
      .insert(album)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, album: Partial<Album>): Promise<Album> {
    const { data, error } = await supabase
      .from('albums')
      .update(album)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const photosService = {
  async getByAlbumId(albumId: string): Promise<Photo[]> {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', albumId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(photo: Omit<Photo, 'id' | 'created_at'>): Promise<Photo> {
    const { data, error } = await supabase
      .from('photos')
      .insert(photo)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const activitiesService = {
  async getAll(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async toggleComplete(id: string, completed: boolean): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .update({ completed })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const checkinsService = {
  async getAll(): Promise<Checkin[]> {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(checkin: Omit<Checkin, 'id' | 'created_at'>): Promise<Checkin> {
    const { data, error } = await supabase
      .from('checkins')
      .insert(checkin)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('checkins')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

export const storageService = {
  async uploadImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { data, error } = await supabase.storage
      .from('love-images')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('love-images')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  },
};
