import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, SafeAreaView, StatusBar, TextInput } from 'react-native';
import api from '../services/api';

const BASE_URL = 'http://10.73.229.142:3000';

const CATEGORIES = ['All', 'Flowers', 'Chocolates', 'Toys', 'Stationary', 'Decor', 'Home', 'Gifts', 'Birthday', 'Kitchen'];

const demoCatalog = (() => {
    const cats = ['Flowers', 'Chocolates', 'Toys', 'Stationary', 'Decor', 'Home'];
    const imgs = ['/uploads/flower_bouquet_main.png', '/uploads/chocolate_box_main.png', '/uploads/mini_toy_main.png', '/uploads/sprout_pencils_product.png', '/uploads/magic_jar_product.png', '/uploads/memory_box.png'];
    
    // Generate proper 24-character hex strings (ObjectId format)
    const generateObjectId = () => {
        return '507f1f77bcf86cd7994390' + Math.floor(Math.random() * 100000).toString().padStart(6, '0');
    };
    
    return Array.from({ length: 12 }, (_, i) => ({
        _id: generateObjectId(),
        name: `Premium Gift Set #${i + 1}`,
        price: parseFloat((Math.random() * 60 + 10).toFixed(2)),
        category: cats[i % cats.length],
        imageUrl: imgs[i % imgs.length],
    }));
})();

const ProductListScreen = ({ navigate, cartCount = 0, addToCart }) => {
    const [products, setProducts] = useState(demoCatalog);
    const [filtered, setFiltered] = useState(demoCatalog);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            if (res.data?.length > 0) {
                setProducts(res.data);
                setFiltered(res.data);
            }
        } catch (e) { /* use demo */ } finally { setLoading(false); }
    };

    const applyFilter = (text, cat) => {
        let result = products;
        if (cat && cat !== 'All') result = result.filter(p => p.category === cat);
        if (text) result = result.filter(p => p.name.toLowerCase().includes(text.toLowerCase()));
        setFiltered(result);
    };

    const handleSearch = (t) => { setSearch(t); applyFilter(t, activeCategory); };
    const handleCategory = (c) => { setActiveCategory(c); applyFilter(search, c); };

    const handleAddToCart = (item) => {
        if (addToCart) {
            addToCart(item);
            // Simple feedback — navigate to checkout option
        }
        // Navigate to checkout (product pre-selected)
        navigate('Checkout', { product: item });
    };

    const renderProduct = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => navigate('Customs', { product: item })} activeOpacity={0.9}>
                <View style={styles.imageWrap}>
                    <Image
                        source={{ uri: `${BASE_URL}${item.imageUrl}` }}
                        style={styles.image}
                        onError={() => {}}
                    />
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>
                </View>
            </TouchableOpacity>

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>${(parseFloat(item.price) || 0).toFixed(2)}</Text>

                <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.personalizeBtn}
                        onPress={() => navigate('Customs', { product: item })}>
                        <Text style={styles.personalizeBtnText}>✨ Design</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cartBtn}
                        onPress={() => handleAddToCart(item)}>
                        <Text style={styles.cartBtnText}>🛒 Buy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f4f8" />

            {/* Search Bar */}
            <View style={styles.searchWrap}>
                <View style={styles.searchBox}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search gifts..."
                        placeholderTextColor="#aaa"
                        value={search}
                        onChangeText={handleSearch}
                    />
                    {search ? (
                        <TouchableOpacity onPress={() => handleSearch('')} style={{paddingHorizontal: 8}}>
                            <Text style={{ color: '#999', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Category Filter */}
            <FlatList
                data={CATEGORIES}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={i => i}
                contentContainerStyle={styles.catList}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.catChip, activeCategory === item && styles.catChipActive]}
                        onPress={() => handleCategory(item)}>
                        <Text style={[styles.catChipText, activeCategory === item && styles.catChipTextActive]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Products */}
            {loading ? (
                <View style={styles.loadBox}>
                    <ActivityIndicator size="large" color="#6200ee" />
                    <Text style={{ color: '#aaa', marginTop: 10 }}>Loading gifts...</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    numColumns={2}
                    keyExtractor={item => item._id}
                    renderItem={renderProduct}
                    contentContainerStyle={styles.grid}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Text style={{ fontSize: 40, marginBottom: 10 }}>🎁</Text>
                            <Text style={{ color: '#999', fontSize: 16 }}>No gifts found</Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8' },

    // Search
    searchWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
    searchInput: { flex: 1, fontSize: 15, color: '#333' },

    // Categories
    catList: { paddingHorizontal: 15, paddingVertical: 10 },
    catChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
    catChipActive: { backgroundColor: '#6200ee' },
    catChipText: { color: '#666', fontSize: 13, fontWeight: '600' },
    catChipTextActive: { color: '#fff' },

    // Grid
    grid: { padding: 10, paddingBottom: 30 },
    loadBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },

    // Card
    card: {
        flex: 1, margin: 7,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
    },
    imageWrap: { position: 'relative' },
    image: { width: '100%', height: 130, backgroundColor: '#f0f0f0' },
    categoryBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(98,0,238,0.85)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    categoryBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

    info: { padding: 12 },
    name: { fontSize: 12, fontWeight: 'bold', color: '#222', marginBottom: 4, height: 34 },
    price: { fontSize: 16, fontWeight: '900', color: '#6200ee', marginBottom: 10 },

    btnRow: { flexDirection: 'row', gap: 6 },
    personalizeBtn: { flex: 1, backgroundColor: '#f3e5f5', paddingVertical: 7, borderRadius: 10, alignItems: 'center' },
    personalizeBtnText: { color: '#6200ee', fontSize: 11, fontWeight: 'bold' },
    cartBtn: { flex: 1, backgroundColor: '#6200ee', paddingVertical: 7, borderRadius: 10, alignItems: 'center' },
    cartBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});

export default ProductListScreen;
