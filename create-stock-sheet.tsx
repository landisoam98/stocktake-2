import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, User, Calendar, FileText, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface FormData {
  sheetName: string;
  description: string;
  location: string;
  createdBy: string;
  scheduledDate: string;
}

interface FormErrors {
  sheetName?: string;
  location?: string;
  createdBy?: string;
  scheduledDate?: string;
}

export default function CreateStockSheet() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state management
  const [formData, setFormData] = useState<FormData>({
    sheetName: '',
    description: '',
    location: '',
    createdBy: 'JOJO', // Default to current user
    scheduledDate: new Date().toISOString().split('T')[0], // Today's date
  });

  // Form validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Available locations for dropdown selection
  const locations = [
    'Warehouse A',
    'Warehouse B',
    'Warehouse C',
    'Storage Room 1',
    'Storage Room 2',
  ];

  // Template options for quick setup
  const templates = [
    { id: 'blank', name: 'Blank Sheet', description: 'Start with an empty sheet' },
    { id: 'furniture', name: 'Furniture Items', description: 'Pre-configured for furniture inventory' },
    { id: 'electronics', name: 'Electronics', description: 'Optimized for electronic components' },
    { id: 'raw-materials', name: 'Raw Materials', description: 'Designed for raw material counting' },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  /**
   * Updates form data for a specific field
   * @param field - The field name to update
   * @param value - The new value for the field
   */
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  /**
   * Validates the form data before submission
   * @returns boolean indicating if form is valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Sheet name validation
    if (!formData.sheetName.trim()) {
      newErrors.sheetName = 'Sheet name is required';
    } else if (formData.sheetName.trim().length < 3) {
      newErrors.sheetName = 'Sheet name must be at least 3 characters';
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    // Created by validation
    if (!formData.createdBy.trim()) {
      newErrors.createdBy = 'Created by field is required';
    }

    // Date validation
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    } else {
      const selectedDate = new Date(formData.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.scheduledDate = 'Scheduled date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission and sheet creation
   */
  const handleCreateSheet = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before creating the sheet.');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate new sheet ID
      const newSheetId = `ST-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      // Mock sheet creation success
      Alert.alert(
        'Success', 
        `Stock take sheet "${formData.sheetName}" has been created successfully!\n\nSheet ID: ${newSheetId}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to stock take sheets list
              router.back();
            }
          }
        ]
      );

    } catch (error) {
      Alert.alert('Error', 'Failed to create stock take sheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles cancel action with confirmation
   */
  const handleCancel = () => {
    const hasChanges = formData.sheetName.trim() || 
                      formData.description.trim() || 
                      formData.location.trim() ||
                      selectedTemplate !== 'blank';

    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };

  /**
   * Generates calendar days for the current month
   */
  const generateCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.getTime() === today.getTime();
      const isPast = currentDate < today;
      const isSelected = currentDate.toISOString().split('T')[0] === formData.scheduledDate;
      
      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isSelected,
        dateString: currentDate.toISOString().split('T')[0]
      });
    }
    
    return days;
  };

  /**
   * Handles date selection from calendar
   */
  const handleDateSelect = (dateString: string) => {
    updateFormData('scheduledDate', dateString);
    setShowCalendar(false);
  };

  /**
   * Navigates to previous month
   */
  const goToPreviousMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  /**
   * Navigates to next month
   */
  const goToNextMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  /**
   * Renders location modal selector
   */
  const renderLocationModal = () => (
    <Modal
      visible={showLocationModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowLocationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.locationModalContainer}>
          <View style={styles.locationModalHeader}>
            <Text style={styles.locationModalTitle}>Select Location</Text>
          </View>
          
          <ScrollView style={styles.locationList}>
            {locations.map((location) => (
              <TouchableOpacity
                key={location}
                style={[
                  styles.locationItem,
                  formData.location === location && styles.locationItemSelected
                ]}
                onPress={() => {
                  updateFormData('location', location);
                  setShowLocationModal(false);
                }}
              >
                <MapPin 
                  size={20} 
                  color={formData.location === location ? '#00897B' : '#9E9E9E'} 
                />
                <Text style={[
                  styles.locationItemText,
                  formData.location === location && styles.locationItemTextSelected
                ]}>
                  {location}
                </Text>
                {formData.location === location && (
                  <View style={styles.selectedIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.locationModalActions}>
            <TouchableOpacity 
              style={styles.locationCancelButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.locationCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  /**
   * Renders calendar picker modal
   */
  const renderCalendarPicker = () => (
    <Modal
      visible={showCalendar}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCalendar(false)}
    >
      <View style={styles.calendarOverlay}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarNavButton}>
              <ChevronLeft size={24} color="#424242" />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>
              {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNavButton}>
              <ChevronRight size={24} color="#424242" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarWeekHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {generateCalendarDays().map((dayInfo, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  !dayInfo.isCurrentMonth && styles.calendarDayInactive,
                  dayInfo.isToday && styles.calendarDayToday,
                  dayInfo.isSelected && styles.calendarDaySelected,
                  dayInfo.isPast && styles.calendarDayPast
                ]}
                onPress={() => !dayInfo.isPast && handleDateSelect(dayInfo.dateString)}
                disabled={dayInfo.isPast}
              >
                <Text style={[
                  styles.calendarDayText,
                  !dayInfo.isCurrentMonth && styles.calendarDayTextInactive,
                  dayInfo.isToday && styles.calendarDayTextToday,
                  dayInfo.isSelected && styles.calendarDayTextSelected,
                  dayInfo.isPast && styles.calendarDayTextPast
                ]}>
                  {dayInfo.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.calendarActions}>
            <TouchableOpacity 
              style={styles.calendarCancelButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.calendarCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  /**
   * Renders template selection cards
   */
  const renderTemplateSelection = () => (
    <View style={styles.templateContainer}>
      <Text style={styles.sectionTitle}>Template Selection</Text>
      <Text style={styles.sectionSubtitle}>Choose a template to get started quickly</Text>
      
      <View style={styles.templateGrid}>
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.templateCard,
              selectedTemplate === template.id && styles.templateCardSelected
            ]}
            onPress={() => setSelectedTemplate(template.id)}
            accessibilityLabel={`Select ${template.name} template`}
            accessibilityState={{ selected: selectedTemplate === template.id }}
          >
            <View style={styles.templateHeader}>
              <FileText 
                size={24} 
                color={selectedTemplate === template.id ? '#00897B' : '#9E9E9E'} 
              />
              <Text style={[
                styles.templateName,
                selectedTemplate === template.id && styles.templateNameSelected
              ]}>
                {template.name}
              </Text>
            </View>
            <Text style={styles.templateDescription}>{template.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleCancel} 
          style={styles.backButton}
          accessibilityLabel="Cancel sheet creation"
          accessibilityHint="Returns to previous screen"
        >
          <ArrowLeft size={24} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Sheet</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {/* Sheet Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Sheet Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.sheetName && styles.inputError]}
              value={formData.sheetName}
              onChangeText={(value) => updateFormData('sheetName', value)}
              placeholder="Enter sheet name"
              placeholderTextColor="#9E9E9E"
              maxLength={50}
              accessibilityLabel="Sheet name input"
              accessibilityHint="Enter a name for your stock take sheet"
            />
            {errors.sheetName && (
              <Text style={styles.errorText}>{errors.sheetName}</Text>
            )}
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Enter description (optional)"
              placeholderTextColor="#9E9E9E"
              multiline
              numberOfLines={3}
              maxLength={200}
              accessibilityLabel="Sheet description input"
              accessibilityHint="Enter an optional description for your sheet"
            />
          </View>

          {/* Location Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Location <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={[styles.input, styles.dropdownInput, errors.location && styles.inputError]}
              onPress={() => setShowLocationModal(true)}
              accessibilityLabel="Select location"
              accessibilityHint="Opens location selection modal"
            >
              <MapPin size={20} color="#9E9E9E" style={styles.inputIcon} />
              <Text style={[styles.dropdownText, !formData.location && styles.placeholderText]}>
                {formData.location || 'Select Location'}
              </Text>
              <ChevronDown size={20} color="#9E9E9E" style={styles.dropdownArrow} />
            </TouchableOpacity>
            {errors.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}
          </View>

          {/* Created By Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Created By <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWithIcon}>
              <User size={20} color="#9E9E9E" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIconText, errors.createdBy && styles.inputError]}
                value={formData.createdBy}
                onChangeText={(value) => updateFormData('createdBy', value)}
                placeholder="Enter creator name"
                placeholderTextColor="#9E9E9E"
                maxLength={30}
                accessibilityLabel="Created by input"
                accessibilityHint="Enter the name of the person creating this sheet"
              />
            </View>
            {errors.createdBy && (
              <Text style={styles.errorText}>{errors.createdBy}</Text>
            )}
          </View>

          {/* Scheduled Date Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Scheduled Date <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={[styles.input, styles.dateInput, errors.scheduledDate && styles.inputError]}
              onPress={() => setShowCalendar(true)}
              accessibilityLabel="Select scheduled date"
              accessibilityHint="Opens calendar to select date"
            >
              <Calendar size={20} color="#9E9E9E" style={styles.inputIcon} />
              <Text style={[styles.dateText, !formData.scheduledDate && styles.placeholderText]}>
                {formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleDateString() : 'Select Date'}
              </Text>
              <ChevronDown size={20} color="#9E9E9E" style={styles.dropdownArrow} />
            </TouchableOpacity>
            {errors.scheduledDate && (
              <Text style={styles.errorText}>{errors.scheduledDate}</Text>
            )}
          </View>
        </View>

        {/* Template Selection Section */}
        {renderTemplateSelection()}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
            disabled={loading}
            accessibilityLabel="Cancel sheet creation"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.createButton, loading && styles.createButtonDisabled]} 
            onPress={handleCreateSheet}
            disabled={loading}
            accessibilityLabel="Create new sheet"
            accessibilityState={{ disabled: loading }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.createButtonText}>Create Sheet</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Calendar Picker Modal */}
      {renderCalendarPicker()}
      
      {/* Location Picker Modal */}
      {renderLocationModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2F1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40, // Same width as back button for centering
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#424242',
  },
  inputError: {
    borderColor: '#F44336',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputWithIconText: {
    paddingLeft: 40,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#424242',
    marginLeft: 28,
    flex: 1,
  },
  placeholderText: {
    color: '#9E9E9E',
  },
  dropdownArrow: {
    marginRight: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#424242',
    marginLeft: 28,
    flex: 1,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 350,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
  },
  calendarWeekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#9E9E9E',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: '#E8F5E8',
  },
  calendarDaySelected: {
    backgroundColor: '#00897B',
  },
  calendarDayPast: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#424242',
  },
  calendarDayTextInactive: {
    color: '#9E9E9E',
  },
  calendarDayTextToday: {
    color: '#00897B',
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  calendarDayTextPast: {
    color: '#BDBDBD',
  },
  calendarActions: {
    marginTop: 20,
    alignItems: 'center',
  },
  calendarCancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  calendarCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  templateContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  templateGrid: {
    gap: 12,
  },
  templateCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  templateCardSelected: {
    borderColor: '#00897B',
    backgroundColor: '#E8F5E8',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginLeft: 8,
  },
  templateNameSelected: {
    color: '#00897B',
  },
  templateDescription: {
    fontSize: 12,
    color: '#9E9E9E',
    lineHeight: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  createButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#00897B',
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  locationModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  locationModalHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  locationModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
  },
  locationList: {
    maxHeight: 300,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    position: 'relative',
  },
  locationItemSelected: {
    backgroundColor: '#E8F5E8',
  },
  locationItemText: {
    fontSize: 16,
    color: '#424242',
    marginLeft: 12,
    flex: 1,
  },
  locationItemTextSelected: {
    color: '#00897B',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00897B',
  },
  locationModalActions: {
    marginTop: 20,
    alignItems: 'center',
  },
  locationCancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  locationCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
});