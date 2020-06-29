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
      const productsCart = await AsyncStorage.getItem(
        '@GoMarketplace:producsCart',
      );

      if (productsCart) {
        setProducts(JSON.parse(productsCart));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const productsInCart = [...products];

      const productIndex = productsInCart.findIndex(prod => prod.id === id);

      productsInCart[productIndex].quantity += 1;

      setProducts([...productsInCart]);

      await AsyncStorage.setItem(
        '@GoMarketplace:producsCart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsInCart = [...products];

      const productIndex = productsInCart.findIndex(prod => prod.id === id);

      if (productsInCart[productIndex].quantity < 2) {
        productsInCart.splice(productIndex, 1);
      } else {
        productsInCart[productIndex].quantity -= 1;
      }

      setProducts([...productsInCart]);

      await AsyncStorage.setItem(
        '@GoMarketplace:producsCart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      const productAlredyInCart = products.find(prod => prod.id === product.id);

      if (productAlredyInCart) {
        await increment(product.id);
      } else {
        const productToAdd = {
          ...product,
          quantity: 1,
        };

        setProducts([...products, productToAdd]);

        await AsyncStorage.setItem(
          '@GoMarketplace:producsCart',
          JSON.stringify(products),
        );
      }
    },
    [increment, products],
  );

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
