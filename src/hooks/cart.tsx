import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const items = await AsyncStorage.getItem('@GoMarketPlace:products');

      if (items) {
        setProducts(JSON.parse(items));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const [productExistent] = products.filter(item => item.id === product.id);

    if (productExistent) {
      const index = products.indexOf(productExistent);

      let items = [...products];

      let item = {
        ...items[index]
      };

      item.quantity += 1;

      items[index] = item;

      await AsyncStorage.setItem('@GoMarketPlace:products', JSON.stringify(items));

      setProducts(items);

    } else {
      const newProduct = {
        ...product,
        quantity: 1
      }

      await AsyncStorage.setItem('@GoMarketPlace:products', JSON.stringify([...products, newProduct]));

      setProducts([...products, newProduct]);
    }

  }, [products]);

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    const [productExistent] = products.filter(product => product.id === id);

    if (productExistent) {
      const index = products.indexOf(productExistent);

      let items = [...products];

      let item = {
        ...items[index]
      };

      item.quantity += 1;

      items[index] = item;

      setProducts(items);

      await AsyncStorage.setItem('@GoMarketPlace:products', JSON.stringify(items));
    }
  }, [products]);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    const [productExistent] = products.filter(product => product.id === id);

    if (productExistent) {
      const index = products.indexOf(productExistent);

      let items = [...products];

      let item = {
        ...items[index]
      };

      if (item.quantity - 1 > 0) {
        item.quantity -= 1;

        items[index] = item;

        setProducts(items);

        await AsyncStorage.setItem('@GoMarketPlace:products', JSON.stringify(items));
      }
    }
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
