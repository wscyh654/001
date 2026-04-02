import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class DishesService {
  async findAll() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('dishes')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dishes:', error);
      throw new Error('获取菜品列表失败');
    }

    return data || [];
  }

  async findOne(id: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('dishes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dish:', error);
      throw new Error('获取菜品详情失败');
    }

    return data;
  }

  async create(createDishDto: {
    name: string;
    category: string;
    cuisineType?: string;
    cookingMethod?: string;
    price: number;
    image?: string;
    images?: string[];
    description?: string;
    stock?: number;
    spiciness?: string;
    temperature?: string;
    specifications?: any;
    isNew?: boolean;
  }) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('dishes')
      .insert({
        name: createDishDto.name,
        category: createDishDto.category,
        cuisine_type: createDishDto.cuisineType || null,
        cooking_method: createDishDto.cookingMethod || null,
        price: createDishDto.price,
        image: createDishDto.image || null,
        images: createDishDto.images || null,
        description: createDishDto.description || null,
        stock: createDishDto.stock ?? 999,
        spiciness: createDishDto.spiciness || 'none',
        temperature: createDishDto.temperature || 'normal',
        specifications: createDishDto.specifications || null,
        is_new: createDishDto.isNew ?? false,
        is_available: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dish:', error);
      throw new Error('创建菜品失败');
    }

    return data;
  }

  async update(id: string, updateDishDto: Partial<{
    name: string;
    category: string;
    cuisineType: string;
    cookingMethod: string;
    price: number;
    image: string;
    images: string[];
    description: string;
    stock: number;
    spiciness: string;
    temperature: string;
    specifications: any;
    isNew: boolean;
    isAvailable: boolean;
    isBanner: boolean;
  }>) {
    const client = getSupabaseClient();
    const updateData: Record<string, any> = {};

    if (updateDishDto.name !== undefined) updateData.name = updateDishDto.name;
    if (updateDishDto.category !== undefined) updateData.category = updateDishDto.category;
    if (updateDishDto.cuisineType !== undefined) updateData.cuisine_type = updateDishDto.cuisineType;
    if (updateDishDto.cookingMethod !== undefined) updateData.cooking_method = updateDishDto.cookingMethod;
    if (updateDishDto.price !== undefined) updateData.price = updateDishDto.price;
    if (updateDishDto.image !== undefined) updateData.image = updateDishDto.image;
    if (updateDishDto.images !== undefined) updateData.images = updateDishDto.images;
    if (updateDishDto.description !== undefined) updateData.description = updateDishDto.description;
    if (updateDishDto.stock !== undefined) updateData.stock = updateDishDto.stock;
    if (updateDishDto.spiciness !== undefined) updateData.spiciness = updateDishDto.spiciness;
    if (updateDishDto.temperature !== undefined) updateData.temperature = updateDishDto.temperature;
    if (updateDishDto.specifications !== undefined) updateData.specifications = updateDishDto.specifications;
    if (updateDishDto.isNew !== undefined) updateData.is_new = updateDishDto.isNew;
    if (updateDishDto.isAvailable !== undefined) updateData.is_available = updateDishDto.isAvailable;
    if (updateDishDto.isBanner !== undefined) updateData.is_banner = updateDishDto.isBanner;

    const { data, error } = await client
      .from('dishes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dish:', error);
      throw new Error('更新菜品失败');
    }

    return data;
  }

  async remove(id: string) {
    const client = getSupabaseClient();
    const { error } = await client
      .from('dishes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing dish:', error);
      throw new Error('删除菜品失败');
    }
  }
}
