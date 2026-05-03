import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, StatusBar, ImageBackground } from 'react-native';

const HomeScreen = ({ navigate }) => {
    const isAdmin = global.userRole === 'admin';

    // User modules
    const userModules = [
        { id: '1', name: 'Shop Collection', icon: '🛍️', screen: 'Products', gradient: ['#1a237e', '#3949ab'], sub: 'Curated Gifts' },
        { id: '2', name: 'My Orders', icon: '📦', screen: 'Orders', gradient: ['#004d40', '#00796b'], sub: 'Track Deliveries' },
        { id: '3', name: 'My Custom Requests', icon: '🎨', screen: 'CustomerCustomRequests', gradient: ['#ff6b6b', '#ee5a24'], sub: 'Track Custom Items' },
        { id: '4', name: 'Personalize', icon: '✨', screen: 'CustomRequest', gradient: ['#4a148c', '#7b1fa2'], sub: 'Make it Yours' },
        { id: '5', name: 'Promo Bar', icon: '🎟️', screen: 'Promos', gradient: ['#e65100', '#f57c00'], sub: 'Exclusive Codes' },
        { id: '6', name: 'Reviews', icon: '⭐', screen: 'Reviews', gradient: ['#f57f17', '#fbc02d'], sub: 'Community' },
        { id: '7', name: 'Media Gallery', icon: '📸', screen: 'MediaGallery', gradient: ['#006064', '#0097a7'], sub: 'Organized Photos' },
    ];

    const displayName = global.userName || (isAdmin ? 'Admin' : 'VIP Member');

    const handleLogout = () => {
        global.userToken = null;
        global.userRole = null;
        global.userName = null;
        global.userId = null;
        navigate('Login');
    };

    if (isAdmin) {
        // ── Admin Home (Premium Redesign) ─────────────────────────────────────────
        return (
            <SafeAreaView style={styles.adminContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#05000a" />

                <View style={styles.adminHero}>
                    <View style={styles.glowOrb} />
                    <View style={styles.adminProfileWrap}>
                        <View style={styles.adminAvatar}>
                            <Text style={styles.adminAvatarText}>👑</Text>
                        </View>
                        <View>
                            <Text style={styles.adminGreeting}>Welcome back Master,</Text>
                            <Text style={styles.adminName}>{displayName}</Text>
                        </View>
                    </View>
                </View>

                {/* Dashboard Entry point */}
                <View style={styles.adminCanvas}>
                    
                    <View style={styles.logoRow}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>EGO</Text>
                        </View>
                        <Text style={styles.logoSub}>PLATFORM ACCESS</Text>
                    </View>
                    
                    <FlatList
                        data={[
                            { id: 'admin_board', title: 'Admin Dashboard', sub: 'Manage Inventory, Orders & Promos', icon: '🛡️', color: '#6200ee', target: 'Products' },
                            { id: 'add_admin', title: 'Add New Admin', sub: 'Create Master Access Accounts', icon: '👨‍💼', color: '#0288d1', target: 'Admins' },
                            { id: 'view_users', title: 'Registered Users', sub: 'View all platform members', icon: '👥', color: '#c2185b', target: 'Users' }
                        ]}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={[styles.portalCard, {backgroundColor: item.color}]} onPress={() => navigate('Admin', { tab: item.target })} activeOpacity={0.85}>
                                <Text style={styles.portalIcon}>{item.icon}</Text>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={styles.portalTitle}>{item.title}</Text>
                                    <Text style={styles.portalSub}>{item.sub}</Text>
                                </View>
                                <Text style={styles.portalArrow}>→</Text>
                            </TouchableOpacity>
                        )}
                        ItemSeparatorComponent={() => <View style={{height: 12}} />}
                    />
                </View>

                {/* Logout Footer Area */}
                <View style={styles.adminFooter}>
                    <View style={styles.footerLine} />
                    <TouchableOpacity style={styles.premiumLogout} onPress={handleLogout} activeOpacity={0.8}>
                        <Text style={styles.premiumLogoutIcon}>🔓</Text>
                        <Text style={styles.premiumLogoutText}>Secure Logout</Text>
                    </TouchableOpacity>
                    <Text style={styles.versionText}>EGO V2.0 Admin System</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ── User Home (Premium Luxury Redesign) ──────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.userContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#05000a" />

            {/* Luxury Header */}
            <View style={styles.userHeader}>
                <View style={styles.userHeaderContent}>
                    <View>
                        <Text style={styles.userWelcome}>Good to see you,</Text>
                        <Text style={styles.userName}>{displayName}</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtnLuxury} onPress={handleLogout}>
                        <Text style={styles.logoutTextLuxury}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
                {/* Hero Banner inside Header */}
                <View style={styles.heroBanner}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroBadge}>EGO EXCLUSIVE</Text>
                        <Text style={styles.heroTitle}>Elegance{"\n"}Delivered.</Text>
                        <TouchableOpacity style={styles.heroBtn} onPress={() => navigate('Products')}>
                            <Text style={styles.heroBtnText}>Explore Collection</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Decorative abstract elements */}
                    <View style={styles.heroDeco1} />
                    <View style={styles.heroDeco2} />
                </View>
            </View>

            <TouchableOpacity style={styles.promoBanner} onPress={() => navigate('Promos')} activeOpacity={0.8}>
                <View style={styles.promoIndicator} />
                <Text style={styles.promoBannerText}>Unlock VIP Promos & Discounts →</Text>
            </TouchableOpacity>

            <View style={styles.gridContainer}>
                <Text style={styles.sectionTitle}>Your EGO Experience</Text>
                <FlatList
                    data={userModules}
                    numColumns={2}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.luxuryCard, { borderColor: item.gradient[0] }]}
                            onPress={() => navigate(item.screen)}
                            activeOpacity={0.8}>
                            
                            <View style={[styles.cardIconBg, { backgroundColor: item.gradient[0] + '15' }]}>
                                <Text style={styles.userCardIcon}>{item.icon}</Text>
                            </View>
                            <Text style={styles.userCardText}>{item.name}</Text>
                            <Text style={styles.cardSub}>{item.sub}</Text>
                            
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // ── Admin Styles ──────────────────────────────────────────
    adminContainer: { flex: 1, backgroundColor: '#05000a' },
    adminHero: { padding: 30, paddingTop: 40, backgroundColor: '#0a0015', borderBottomWidth: 1, borderBottomColor: 'rgba(98,0,238,0.3)', position: 'relative', overflow: 'hidden' },
    glowOrb: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(98,0,238,0.15)', top: -50, right: -50 },
    adminProfileWrap: { flexDirection: 'row', alignItems: 'center' },
    adminAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(3,218,198,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#03dac6', marginRight: 16 },
    adminAvatarText: { fontSize: 28 },
    adminGreeting: { color: '#03dac6', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
    adminName: { color: '#fff', fontSize: 26, fontWeight: '900' },
    adminCanvas: { flex: 1, padding: 24, paddingTop: 20 },
    logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    logoCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(98,0,238,0.4)', borderWidth: 2, borderColor: '#03dac6', justifyContent: 'center', alignItems: 'center', shadowColor: '#03dac6', shadowOpacity: 0.8, shadowRadius: 15, elevation: 8, marginRight: 10 },
    logoText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
    logoSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
    portalCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, elevation: 8 },
    portalIcon: { fontSize: 36 },
    portalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    portalSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    portalArrow: { color: '#fff', fontSize: 24, fontWeight: '900', opacity: 0.8 },
    adminFooter: { padding: 30, alignItems: 'center' },
    footerLine: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
    premiumLogout: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.1)', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', marginBottom: 16 },
    premiumLogoutIcon: { fontSize: 16, marginRight: 10 },
    premiumLogoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
    versionText: { color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 'bold' },


    // ── User Luxury Styles ───────────────────────────────────────────────
    userContainer: { flex: 1, backgroundColor: '#0a0015' },
    
    userHeader: { backgroundColor: '#13002b', borderBottomLeftRadius: 35, borderBottomRightRadius: 35, paddingBottom: 30, overflow: 'hidden', paddingHorizontal: 24 },
    userHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, marginBottom: 25 },
    userWelcome: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    userName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 2, letterSpacing: 0.5 },
    
    logoutBtnLuxury: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    logoutTextLuxury: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },

    heroBanner: { backgroundColor: '#1a0033', borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', elevation: 15, shadowColor: '#6200ee', shadowOpacity: 0.5, shadowRadius: 20 },
    heroContent: { position: 'relative', zIndex: 2 },
    heroBadge: { color: '#03dac6', fontSize: 10, fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
    heroTitle: { color: '#fff', fontSize: 32, fontWeight: '900', lineHeight: 36, marginBottom: 20, letterSpacing: 1 },
    heroBtn: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, alignSelf: 'flex-start' },
    heroBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
    
    heroDeco1: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(98,0,238,0.4)', right: -40, top: -40, zIndex: 1 },
    heroDeco2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(3,218,198,0.2)', right: 40, bottom: -20, zIndex: 1 },

    promoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 24, marginTop: -20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', zIndex: 10 },
    promoIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#03dac6', marginRight: 12, shadowColor: '#03dac6', shadowOpacity: 1, shadowRadius: 5 },
    promoBannerText: { color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },

    gridContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 30 },
    sectionTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 15, marginLeft: 8 },
    
    luxuryCard: { 
        flex: 1, margin: 8, height: 160, 
        backgroundColor: 'rgba(255,255,255,0.03)', 
        borderRadius: 24, 
        justifyContent: 'flex-end', alignItems: 'flex-start', padding: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
    },
    cardIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    userCardIcon: { fontSize: 24 },
    userCardText: { fontSize: 16, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5, marginBottom: 4 },
    cardSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600' }
});

export default HomeScreen;
