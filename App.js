import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, FlatList, ScrollView, Platform, Linking } from 'react-native';
import {
    Provider as PaperProvider,
    Searchbar,
    Card,
    Text,
    Chip,
    Portal,
    Modal,
    List,
    Button,
} from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import conditionsData from './assets/data.json';

const getColorForValue = (value) => {
    switch (value) {
        case '1':
            return '#009200FF'; // dark green
        case '2':
            return '#5BC515FF'; // green
        case '3':
            return '#D96888FF'; // pink
        case '4':
            return '#FF0000'; // red
        default:
            return '#757575'; // grey
    }
};

export default function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [filteredConditions, setFilteredConditions] = useState([]);
    const [selectedConditions, setSelectedConditions] = useState([]);

    const handleOpenPDF = async () => {
        const pdfUrl =
            'https://raw.githubusercontent.com/Atomic-Lemur/us-medical-eligibility-criteria-for-contraceptive-use/main/assets/summary_chart.pdf';

        if (Platform.OS === 'web') {
            // For web, directly open the PDF in a new tab
            window.open(pdfUrl, '_blank');
        } else {
            // For mobile platforms, use WebBrowser
            try {
                await WebBrowser.openBrowserAsync(pdfUrl);
            } catch (error) {
                console.error('Error opening PDF:', error);
                // Fallback to default browser if WebBrowser fails
                await Linking.openURL(pdfUrl);
            }
        }
    };

    const handleSearchFocus = () => {
        setModalVisible(true);
        setSearchQuery('');
        setFilteredConditions([]);
    };

    const handleRemoveCondition = (conditionToRemove) => {
        console.log('Removing condition:', conditionToRemove);
        setSelectedConditions(selectedConditions.filter((condition) => condition !== conditionToRemove));
    };

    const debouncedSearch = useCallback(
        (query) => {
            if (query.length >= 3) {
                console.log('Debounced search running with query:', query);
                console.log('Current selectedConditions:', selectedConditions);
                const filtered = Object.entries(conditionsData)
                    .filter(([condition]) => {
                        const matches = condition.toLowerCase().includes(query.toLowerCase());
                        const isSelected = selectedConditions.some(
                            (selected) => selected.toLowerCase() === condition.toLowerCase()
                        );

                        return matches && !isSelected;
                    })
                    .map(([condition]) => condition);

                console.log('Filtered conditions:', filtered);
                setFilteredConditions(filtered);
            } else {
                setFilteredConditions([]);
            }
        },
        [selectedConditions]
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            debouncedSearch(searchQuery);
        }, 300); // 300ms delay

        return () => clearTimeout(timeoutId);
    }, [searchQuery, debouncedSearch]);

    const onChangeSearch = (query) => {
        setSearchQuery(query);
    };

    const handleSelectCondition = (condition) => {
        if (!selectedConditions.includes(condition)) {
            setSelectedConditions([...selectedConditions, condition]);
        }
        setSearchQuery('');
        setFilteredConditions([]);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSearchQuery('');
        setFilteredConditions([]);
    };

    const renderSelectedConditions = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
            {selectedConditions.map((condition) => (
                <Chip
                    key={condition}
                    onClose={() => handleRemoveCondition(condition)}
                    style={styles.chip}
                    mode='outlined'
                >
                    {condition}
                </Chip>
            ))}
        </ScrollView>
    );

    const renderConditionDetails = () => (
        <ScrollView style={styles.detailsContainer}>
            {selectedConditions.map((condition) => (
                <Card key={condition} style={styles.card}>
                    <Card.Content>
                        <Text variant='titleMedium' style={styles.conditionTitle}>
                            {condition}
                        </Text>
                        <View style={styles.methodsContainer}>
                            {Object.entries(conditionsData[condition]).map(
                                ([method, values]) =>
                                    values.I && (
                                        <View key={method} style={styles.methodItem}>
                                            <Text variant='bodyMedium' style={styles.methodName}>
                                                {method}
                                            </Text>
                                            <View style={styles.valuesContainer}>
                                                <Text
                                                    style={[
                                                        styles.value,
                                                        { backgroundColor: getColorForValue(values.I) },
                                                    ]}
                                                >
                                                    Initiation: {values.I}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.value,
                                                        { backgroundColor: getColorForValue(values.C) },
                                                    ]}
                                                >
                                                    Continuation: {values.C}
                                                </Text>
                                            </View>
                                        </View>
                                    )
                            )}
                        </View>
                    </Card.Content>
                </Card>
            ))}
        </ScrollView>
    );

    return (
        <PaperProvider>
            <View style={[styles.container, { paddingTop: Platform.OS === 'ios' ? 50 : 25 }]}>
                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder='Search conditions (min. 3 characters)'
                        onChangeText={onChangeSearch}
                        value={searchQuery}
                        style={styles.searchbar}
                        onFocus={handleSearchFocus}
                    />
                    {renderSelectedConditions()}
                </View>

                {renderConditionDetails()}

                <Portal>
                    <Modal
                        visible={modalVisible}
                        onDismiss={() => handleCloseModal()}
                        contentContainerStyle={[
                            styles.modal,
                            Platform.OS === 'ios' ? { marginTop: 60 } : { marginTop: 40 },
                        ]}
                    >
                        <FlatList
                            data={filteredConditions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <List.Item
                                    title={item}
                                    onPress={() => handleSelectCondition(item)}
                                    style={styles.modalItem}
                                />
                            )}
                            ListEmptyComponent={() =>
                                searchQuery.length > 0 && searchQuery.length < 3 ? (
                                    <Text style={styles.emptyText}>Type at least 3 characters to search</Text>
                                ) : null
                            }
                        />
                    </Modal>
                </Portal>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        1 = A condition for which there is no restriction for the use of the contraceptive method
                    </Text>
                    <Text style={styles.infoText}>
                        2 = A condition for which the advantages of using the method generally outweigh the theoretical
                        or proven risks
                    </Text>
                    <Text style={styles.infoText}>
                        3 = A condition for which the theoretical or proven risks usually outweigh the advantages of
                        using the method
                    </Text>
                    <Text style={styles.infoText}>
                        4 = A condition that represents an unacceptable health risk if the contraceptive method is used
                    </Text>
                    <Text style={styles.infoText}>source: US Medical Eligibility Criteria for Contraceptive Use</Text>
                    <View style={styles.pdfButtonContainer}>
                        <Button mode='contained' onPress={handleOpenPDF} style={styles.pdfButton}>
                            View Summary Chart (PDF)
                        </Button>
                    </View>
                </View>
            </View>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        backgroundColor: '#fff',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchbar: {
        margin: 16,
        marginBottom: 8,
    },
    chipsContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    chip: {
        marginRight: 8,
    },
    detailsContainer: {
        flex: 1,
    },
    card: {
        margin: 8,
        marginHorizontal: 16,
    },
    conditionTitle: {
        marginBottom: 8,
    },
    methodsContainer: {
        gap: 8,
    },
    methodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    methodName: {
        flex: 1,
        marginRight: 16,
    },
    valuesContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    value: {
        fontWeight: 'bold',
        color: 'white',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        overflow: 'hidden',
        minWidth: 45,
        textAlign: 'center',
    },
    modal: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 'auto',
        padding: 16,
        borderRadius: 8,
        maxHeight: '80%',
    },
    modalItem: {
        paddingVertical: 4,
    },
    emptyText: {
        textAlign: 'center',
        padding: 16,
        color: '#757575',
    },
    infoBox: {
        padding: 16,
        paddingBottom: 30,
        backgroundColor: '#f0f0f0',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    infoText: {
        fontSize: 10,
    },
    pdfButtonContainer: {
        padding: 5,
    },
    pdfButton: {
        marginVertical: 1,
    },
});
