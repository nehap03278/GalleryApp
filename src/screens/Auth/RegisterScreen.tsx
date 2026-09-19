import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { Dropdown } from '../../components/Dropdown';
import { RadioGroup } from '../../components/RadioGroup';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../types/navigation';
import type { Gender, RegisterFormData, RegisterFormErrors } from '../../types/auth';
import { hasErrors, validateRegisterForm } from '../../utils/validation';
import { CITY_OPTIONS, GENDER_OPTIONS } from '../../utils/constants';
import { colors, spacing } from '../../utils/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const INITIAL_FORM: RegisterFormData = {
  fullName: '',
  email: '',
  gender: null,
  mobileNumber: '',
  address: '',
  city: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof RegisterFormData>(key: K, value: RegisterFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit() {
    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setIsSubmitting(true);
    try {
      const result = await register(form);
      if (!result.success) {
        Alert.alert('Registration Failed', result.error ?? 'Please try again.');
        return;
      }
      Alert.alert('Success', 'Your account has been created. Please log in.', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Fill in your details to get started</Text>

          <InputField
            label="Full Name"
            placeholder="Jane Doe"
            value={form.fullName}
            onChangeText={(text) => updateField('fullName', text)}
            error={errors.fullName}
          />
          <InputField
            label="Email Address"
            placeholder="jane@example.com"
            value={form.email}
            onChangeText={(text) => updateField('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <RadioGroup<Gender>
            label="Gender"
            options={GENDER_OPTIONS}
            selectedValue={form.gender}
            onChange={(value) => updateField('gender', value)}
            error={errors.gender}
          />
          <InputField
            label="Mobile Number"
            placeholder="10-digit mobile number"
            value={form.mobileNumber}
            onChangeText={(text) => updateField('mobileNumber', text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={10}
            error={errors.mobileNumber}
          />
          <InputField
            label="Address"
            placeholder="Street, area"
            value={form.address}
            onChangeText={(text) => updateField('address', text)}
            multiline
            error={errors.address}
          />
          <Dropdown
            label="City"
            selectedValue={form.city}
            onValueChange={(value) => updateField('city', value)}
            options={CITY_OPTIONS.map((city) => ({ label: city, value: city }))}
            placeholder="Select your city"
            error={errors.city}
          />
          <InputField
            label="Password"
            placeholder="At least 6 characters"
            value={form.password}
            onChangeText={(text) => updateField('password', text)}
            secureTextEntry
            error={errors.password}
          />
          <InputField
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button title="Register" onPress={handleSubmit} loading={isSubmitting} style={styles.submitButton} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Text style={styles.link} onPress={() => navigation.replace('Login')}>
              {' '}Log In
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
