import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, SafeAreaView, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import api, { login } from '../services/api';

const Field = ({ icon, placeholder, value, onChange, secure, keyboard, onFocus, onBlur, isFocused }) => (
    <View style={[styles.inputWrap, isFocused && styles.inputWrapFocused]}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={value}
            onChangeText={onChange}
            secureTextEntry={secure}
            keyboardType={keyboard || 'default'}
            autoCapitalize={keyboard === 'email-address' ? 'none' : 'none'}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    </View>
);

const LoginScreen = ({ navigate }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleLogin = async () => {
        if (!identifier || !password) return Alert.alert('EGO', 'Please enter your email/name and password.');

        setLoading(true);
        try {
            const res = await api.post('/auth/login', { identifier, password });
            const data = res.data;
            global.userToken = data.token;
            global.userRole = data.user.role;
            global.userName = data.user.name;
            global.userId = data.user.id;
            
            navigate('Home');
        } catch (error) {
            Alert.alert('Login Failed', JSON.stringify(error.response?.data) || error.message || 'Network Error');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        if (!identifier) return Alert.alert('Forgot Password', 'Please enter your email address in the field above first.');
        
        Alert.alert(
            'Reset Password',
            `Reset password for ${identifier}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', onPress: async () => {
                    try {
                        const res = await api.post('/auth/forgot-password', { email: identifier });
                        Alert.alert('✅ Success', res.data.message);
                    } catch (error) {
                        Alert.alert('Error', error.response?.data?.message || 'Failed to reset password');
                    }
                }}
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0015" />
            
            {/* Background Orbs */}
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    
                    <View style={{ height: 40 }} />
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>EGO</Text>
                        </View>
                        <Text style={styles.headerTitle}>Welcome Back</Text>
                        <Text style={styles.headerSub}>Sign in to continue to EGO</Text>
                    </View>

                    {/* Glass Login Card */}
                    <View style={styles.glassCard}>
                        <Field 
                            icon="👤" placeholder="Email or Full Name" value={identifier} onChange={setIdentifier} 
                            isFocused={focusedField === 'identifier'} onFocus={() => setFocusedField('identifier')} onBlur={() => setFocusedField(null)} 
                        />
                        <Field 
                            icon="🔒" placeholder="Password" value={password} onChange={setPassword} secure 
                            isFocused={focusedField === 'pass'} onFocus={() => setFocusedField('pass')} onBlur={() => setFocusedField(null)} 
                        />

                        {/* Forgot Password Link */}
                        <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 20 }} onPress={handleForgotPassword}>
                            <Text style={{ color: '#03dac6', fontSize: 13, fontWeight: '600' }}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.signInBtn, loading && { opacity: 0.7 }]} 
                            onPress={handleLogin} 
                            disabled={loading}
                            activeOpacity={0.8}>
                            <Text style={styles.signInText}>{loading ? 'Authenticating...' : 'Sign In ➔'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Links */}
                    <TouchableOpacity style={styles.registerLink} onPress={() => navigate('Register')}>
                        <Text style={styles.registerLinkText}>
                            New to EGO? <Text style={{ color: '#03dac6', fontWeight: 'bold' }}>Create an Account</Text>
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0015' },
    orb1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(98,0,238,0.25)', top: -100, right: -100 },
    orb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(3,218,198,0.15)', bottom: 0, left: -80 },

    content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },

    header: { alignItems: 'center', marginBottom: 40 },
    logoCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(98,0,238,0.6)',
        borderWidth: 2, borderColor: '#03dac6',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
        shadowColor: '#6200ee', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10
    },
    logoText: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 4 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
    headerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },

    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 30, padding: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 5
    },

    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16, marginBottom: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16, paddingVertical: 4
    },
    inputWrapFocused: { borderColor: 'rgba(3,218,198,0.5)', backgroundColor: 'rgba(3,218,198,0.05)' },
    inputIcon: { fontSize: 16, marginRight: 12 },
    input: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 14 },

    signInBtn: {
        backgroundColor: '#6200ee', paddingVertical: 18,
        borderRadius: 16, alignItems: 'center',
        shadowColor: '#6200ee', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 8
    },
    signInText: { color: '#fff', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },

    registerLink: { alignItems: 'center', marginTop: 30 },
    registerLinkText: { color: 'rgba(255,255,255,0.5)', fontSize: 15 },
});

export default LoginScreen;
