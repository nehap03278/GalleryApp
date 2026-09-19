import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { Dropdown } from '../../components/Dropdown';
import { RadioGroup } from '../../components/RadioGroup';
import { useAuth } from '../../hooks/useAuth';
import type { Gender, ProfileFormData, ProfileFormErrors } from '../../types/auth';
import { hasErrors, validateProfileForm } from '../../utils/validation';
import { CITY_OPTIONS, GENDER_OPTIONS } from '../../utils/constants';
import { colors, radii, spacing } from '../../utils/theme';

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [form, setForm] = useState<ProfileFormData>({
    fullName: user?.fullName ?? '',
    mobileNumber: user?.mobileNumber ?? '',
    gender: user?.gender ?? 'Other',
    address: user?.address ?? '',
    city: user?.city ?? '',
  });

  function updateField<K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleStartEditing() {
    if (user) {
      setForm({
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        address: user.address,
        city: user.city,
      });
    }
    setErrors({});
    setIsEditing(true);
  }

  function handleCancel() {
    if (user) {
      setForm({
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        address: user.address,
        city: user.city,
      });
    }
    setErrors({});
    setIsEditing(false);
  }

  async function handleSave() {
    const validationErrors = validateProfileForm(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setIsSaving(true);
    try {
      const result = await updateProfile(form);
      if (!result.success) {
        Alert.alert('Update Failed', result.error ?? 'Please try again.');
        return;
      }
      setIsEditing(false);
      Alert.alert('Success', 'Your profile has been updated.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{user.fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {isEditing ? (
          <View style={styles.form}>
            <InputField
              label="Full Name"
              value={form.fullName}
              onChangeText={(text) => updateField('fullName', text)}
              error={errors.fullName}
            />
            <RadioGroup<Gender>
              label="Gender"
              options={GENDER_OPTIONS}
              selectedValue={form.gender}
              onChange={(value) => updateField('gender', value)}
            />
            <InputField
              label="Mobile Number"
              value={form.mobileNumber}
              onChangeText={(text) => updateField('mobileNumber', text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={10}
              error={errors.mobileNumber}
            />
            <InputField
              label="Address"
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
              error={errors.city}
            />

            <View style={styles.editActions}>
              <Button title="Cancel" variant="secondary" onPress={handleCancel} style={styles.actionButton} />
              <Button title="Save" onPress={handleSave} loading={isSaving} style={styles.actionButton} />
            </View>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <InfoRow label="Full Name" value={user.fullName} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Mobile Number" value={user.mobileNumber} />
            <InfoRow label="Gender" value={user.gender} />
            <InfoRow label="Address" value={user.address} />
            <InfoRow label="City" value={user.city} />

            <Button title="Edit Profile" variant="secondary" onPress={handleStartEditing} style={styles.editButton} />
          </View>
        )}

        {!isEditing && (
          <Button title="Log Out" variant="danger" onPress={handleLogout} style={styles.logoutButton} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarInitial: {
    fontSize: 32,
    color: colors.white,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  infoRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  editButton: {
    marginTop: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
