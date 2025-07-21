import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Plus, ChevronDown, Filter, ChevronRight } from 'lucide-react-native';

interface StockSheet {
  id: string;
  sheetId: string;
  date: string;
  location: string;
  createdBy: string;
  status: 'Draft' | 'In Progress' | 'Completed';
  totalItems: number;
  discrepancies: number;
  expanded: boolean;
}

interface StockItem {
  id: string;
  sheetId: string;
  category: string;
  itemName: string;
  itemDescription: string;
  location: string;
  systemQuantity: number;
  countedQuantity: number | null;
  unit: string;
  variance: number;
}

export default function StockTakeSheets() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sheet' | 'item'>('sheet');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [countInput, setCountInput] = useState('');
  const [expandedLocations, setExpandedLocations] = useState<string[]>(['Warehouse A']);

  const [sheets, setSheets] = useState<StockSheet[]>([
    {
      id: '1',
      sheetId: 'ST-202507000001',
      date: '07/22/2025',
      location: 'Warehouse A',
      createdBy: 'JOJO',
      status: 'In Progress',
      totalItems: 5,
      discrepancies: 2,
      expanded: false,
    },
    {
      id: '2',
      sheetId: 'ST-202507000002',
      date: '07/21/2025',
      location: 'Warehouse B',
      createdBy: 'ADMIN',
      status: 'Completed',
      totalItems: 8,
      discrepancies: 1,
      expanded: false,
    },
    {
      id: '3',
      sheetId: 'ST-202507000003',
      date: '07/20/2025',
      location: 'Warehouse A',
      createdBy: 'JOJO',
      status: 'Draft',
      totalItems: 3,
      discrepancies: 0,
      expanded: false,
    },
  ]);

  const [items, setItems] = useState<StockItem[]>([
    {
      id: '1',
      sheetId: 'ST-202507000001',
      category: 'FURNITURE',
      itemName: 'Brake Disc with Granite Slab',
      itemDescription: 'Solar Inverter with LDPE Film finish',
      location: 'Warehouse A',
      systemQuantity: 100,
      countedQuantity: 98,
      unit: 'UNIT',
      variance: -2,
    },
    {
      id: '2',
      sheetId: 'ST-202507000001',
      category: 'ELECTRONICS',
      itemName: 'Industrial Motor Controller',
      itemDescription: 'Heavy duty motor controller with cooling system',
      location: 'Warehouse A',
      systemQuantity: 25,
      countedQuantity: null,
      unit: 'PCS',
      variance: 0,
    },
    {
      id: '3',
      sheetId: 'ST-202507000002',
      category: 'RAW MATERIAL',
      itemName: 'Steel Rod Bundle',
      itemDescription: 'Premium steel rods for construction',
      location: 'Warehouse B',
      systemQuantity: 50,
      countedQuantity: 52,
      unit: 'BUNDLE',
      variance: 2,
    },
    {
      id: '4',
      sheetId: 'ST-202507000001',
      category: 'TOOLS',
      itemName: 'Precision Drill Set',
      itemDescription: 'Professional drill set with case',
      location: 'Warehouse A',
      systemQuantity: 15,
      countedQuantity: null,
      unit: 'SET',
      variance: 0,
    },
    {
      id: '5',
      sheetId: 'ST-202507000002',
      category: 'SAFETY',
      itemName: 'Safety Helmet',
      itemDescription: 'Industrial safety helmet with chin strap',
      location: 'Warehouse B',
      systemQuantity: 200,
      countedQuantity: 195,
      unit: 'PCS',
      variance: -5,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return '#9E9E9E';
      case 'In Progress': return '#FFC107';
      case 'Completed': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const toggleSheetExpansion = (sheetId: string) => {
    setSheets(prev => prev.map(sheet => 
      sheet.id === sheetId ? { ...sheet, expanded: !sheet.expanded } : sheet
    ));
  };

  const toggleLocationExpansion = (location: string) => {
    setExpandedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(loc => loc !== location)
        : [...prev, location]
    );
  };

  const openCountModal = (item: StockItem) => {
    setSelectedItem(item);
    setCountInput(item.countedQuantity?.toString() || item.systemQuantity.toString());
    setModalVisible(true);
  };

  const saveCount = () => {
    if (selectedItem && countInput) {
      const newCount = parseInt(countInput);
      const newVariance = newCount - selectedItem.systemQuantity;
      
      setItems(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, countedQuantity: newCount, variance: newVariance }
          : item
      ));
      
      setModalVisible(false);
      setSelectedItem(null);
      setCountInput('');
      Alert.alert('Success', 'Count updated successfully');
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.location]) {
      acc[item.location] = [];
    }
    acc[item.location].push(item);
    return acc;
  }, {} as Record<string, StockItem[]>);

  const renderBySheetTab = () => (
    <ScrollView style={styles.tabContent}>
      {sheets.map((sheet) => (
        <View key={sheet.id} style={styles.sheetCard}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetInfo}>
              <Text style={styles.sheetId}>{sheet.sheetId}</Text>
              <Text style={styles.sheetDate}>{sheet.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sheet.status) }]}>
              <Text style={styles.statusText}>{sheet.status}</Text>
            </View>
          </View>
          
          <View style={styles.sheetDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{sheet.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created By</Text>
              <Text style={styles.detailValue}>{sheet.createdBy}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Items</Text>
              <Text style={styles.detailValue}>{sheet.totalItems} Items</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Discrepancy</Text>
              <Text style={[styles.detailValue, { color: sheet.discrepancies > 0 ? '#FF9800' : '#4CAF50' }]}>
                {sheet.discrepancies} variances
              </Text>
            </View>
          </View>
          
          <View style={styles.sheetActions}>
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={() => toggleSheetExpansion(sheet.id)}
            >
              <Text style={styles.expandText}>Expand</Text>
              <ChevronDown size={16} color="#424242" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View</Text>
            </TouchableOpacity>
            {(sheet.status === 'Draft' || sheet.status === 'In Progress') && (
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#00897B' }]}>
                <Text style={[styles.actionButtonText, { color: 'white' }]}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {sheet.expanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedTitle}>Items Summary:</Text>
              <Text style={styles.expandedText}>• Furniture Items: 2</Text>
              <Text style={styles.expandedText}>• Electronics: 1</Text>
              <Text style={styles.expandedText}>• Tools: 2</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderByItemTab = () => (
    <ScrollView style={styles.tabContent}>
      {Object.entries(groupedItems).map(([location, locationItems]) => (
        <View key={location} style={styles.locationSection}>
          <TouchableOpacity 
            style={styles.locationHeader}
            onPress={() => toggleLocationExpansion(location)}
          >
            <Text style={styles.locationTitle}>{location}</Text>
            <ChevronRight 
              size={20} 
              color="#424242" 
              style={{ 
                transform: [{ rotate: expandedLocations.includes(location) ? '90deg' : '0deg' }] 
              }} 
            />
          </TouchableOpacity>
          
          {expandedLocations.includes(location) && locationItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => openCountModal(item)}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.categoryText}>{item.category}</Text>
                <Text style={styles.sheetReference}>{item.sheetId}</Text>
              </View>
              
              <Text style={styles.itemName}>{item.itemName}</Text>
              <Text style={styles.itemDescription}>{item.itemDescription}</Text>
              
              <View style={styles.quantityRow}>
                <View style={styles.quantityColumn}>
                  <Text style={styles.quantityLabel}>System Qty</Text>
                  <Text style={styles.quantityValue}>{item.systemQuantity} {item.unit}</Text>
                </View>
                <View style={styles.quantityColumn}>
                  <Text style={styles.quantityLabel}>Counted Qty</Text>
                  <Text style={[styles.quantityValue, { color: item.countedQuantity ? '#00897B' : '#9E9E9E' }]}>
                    {item.countedQuantity ? `${item.countedQuantity} ${item.unit}` : 'Not counted'}
                  </Text>
                </View>
                <View style={styles.quantityColumn}>
                  <Text style={styles.quantityLabel}>Variance</Text>
                  <Text style={[
                    styles.quantityValue, 
                    { color: item.variance > 0 ? '#4CAF50' : item.variance < 0 ? '#F44336' : '#9E9E9E' }
                  ]}>
                    {item.variance > 0 ? '+' : ''}{item.variance}
                  </Text>
                </View>
              </View>
              
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      
      <TouchableOpacity style={styles.submitButton} onPress={() => Alert.alert('Success', 'Counts submitted successfully')}>
        <Text style={styles.submitButtonText}>Submit Count</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#424242" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stock Take Sheets</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Search size={20} color="#424242" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/create-stock-sheet')}
          >
            <Plus size={20} color="#424242" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sheet' && styles.activeTab]}
          onPress={() => setActiveTab('sheet')}
        >
          <Text style={[styles.tabText, activeTab === 'sheet' && styles.activeTabText]}>By Sheet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'item' && styles.activeTab]}
          onPress={() => setActiveTab('item')}
        >
          <Text style={[styles.tabText, activeTab === 'item' && styles.activeTabText]}>By Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Sorting</Text>
          <ChevronDown size={16} color="#424242" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Status</Text>
          <ChevronDown size={16} color="#424242" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Location</Text>
          <ChevronDown size={16} color="#424242" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterIconButton}>
          <Filter size={16} color="#424242" />
        </TouchableOpacity>
      </View>

      {activeTab === 'sheet' ? renderBySheetTab() : renderByItemTab()}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Count</Text>
            {selectedItem && (
              <>
                <Text style={styles.modalItemName}>{selectedItem.itemName}</Text>
                <Text style={styles.modalSystemQty}>System Quantity: {selectedItem.systemQuantity} {selectedItem.unit}</Text>
                
                <Text style={styles.inputLabel}>Counted Quantity:</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={countInput}
                  onChangeText={setCountInput}
                  keyboardType="numeric"
                  placeholder="Enter counted quantity"
                />
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={saveCount}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00897B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9E9E9E',
  },
  activeTabText: {
    color: '#00897B',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 4,
  },
  filterIconButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  filterText: {
    fontSize: 12,
    color: '#424242',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sheetCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sheetInfo: {
    flex: 1,
  },
  sheetId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  sheetDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  sheetDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#424242',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  expandText: {
    fontSize: 12,
    color: '#424242',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#424242',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  expandedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  expandedText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9E9E9E',
    textTransform: 'uppercase',
  },
  sheetReference: {
    fontSize: 10,
    color: '#00897B',
    fontWeight: '500',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quantityColumn: {
    flex: 1,
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 10,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  quantityValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 10,
    color: '#424242',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#00897B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSystemQty: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#00897B',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});