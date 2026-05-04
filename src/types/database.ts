export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: "admin" | "editor"
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: "admin" | "editor"
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: "admin" | "editor"
          updated_at?: string
        }
        Relationships: []
      }
      site_articles: {
        Row: {
          author: string
          content: string
          content_tr: string
          created_at: string
          display_order: number
          excerpt: string
          excerpt_tr: string
          id: string
          image_url: string | null
          is_published: boolean
          page: "home" | "about"
          title: string
          title_tr: string
          updated_at: string
        }
        Insert: {
          author?: string
          content: string
          content_tr?: string
          created_at?: string
          display_order?: number
          excerpt?: string
          excerpt_tr?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          page?: "home" | "about"
          title: string
          title_tr?: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          content_tr?: string
          created_at?: string
          display_order?: number
          excerpt?: string
          excerpt_tr?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          page?: "home" | "about"
          title?: string
          title_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content_entries: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string
          description: string
          description_tr: string
          display_order: number
          id: string
          icon_name: string
          image_url: string
          is_active: boolean
          name: string
          name_tr: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          description_tr?: string
          display_order?: number
          id?: string
          icon_name?: string
          image_url?: string
          is_active?: boolean
          name: string
          name_tr?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          description_tr?: string
          display_order?: number
          id?: string
          icon_name?: string
          image_url?: string
          is_active?: boolean
          name?: string
          name_tr?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_item_tags: {
        Row: {
          item_id: string
          tag: "vegan" | "vegetarian" | "spicy" | "containsNuts" | "glutenFree" | "bestseller"
        }
        Insert: {
          item_id: string
          tag: "vegan" | "vegetarian" | "spicy" | "containsNuts" | "glutenFree" | "bestseller"
        }
        Update: {
          item_id?: string
          tag?: "vegan" | "vegetarian" | "spicy" | "containsNuts" | "glutenFree" | "bestseller"
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          description: string
          description_tr: string
          display_order: number
          id: string
          image_url: string | null
          is_available: boolean
          is_featured: boolean
          name: string
          name_tr: string
          price: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string
          description_tr?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          name: string
          name_tr?: string
          price: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          description_tr?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          name?: string
          name_tr?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
