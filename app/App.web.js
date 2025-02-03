import React, { useState, useCallback, useEffect } from 'react';
import {
    Container,
    Card,
    CardContent,
    Chip,
    Dialog,
    List,
    ListItem,
    ListItemText,
    Button,
    TextField,
    Typography,
    Box,
    Paper,
    Grid,
} from '@mui/material';
import conditionsData from '../assets/data.json';
import { getColorForValue, INFO_TEXTS, PDF_URL } from './utils';

export default function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [filteredConditions, setFilteredConditions] = useState([]);
    const [selectedConditions, setSelectedConditions] = useState([]);

    const handleRemoveCondition = (conditionToRemove) => {
        setSelectedConditions(selectedConditions.filter((condition) => condition !== conditionToRemove));
    };

    const debouncedSearch = useCallback(
        (query) => {
            if (query.length >= 3) {
                const filtered = Object.entries(conditionsData)
                    .filter(([condition]) => {
                        const matches = condition.toLowerCase().includes(query.toLowerCase());
                        const isSelected = selectedConditions.some(
                            (selected) => selected.toLowerCase() === condition.toLowerCase()
                        );
                        return matches && !isSelected;
                    })
                    .map(([condition]) => condition);
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
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, debouncedSearch]);

    const onChangeSearch = (event) => {
        setDialogOpen(true);
        setSearchQuery(event.target.value);
    };

    const handleSelectCondition = (condition) => {
        if (!selectedConditions.includes(condition)) {
            setSelectedConditions([...selectedConditions, condition]);
        }
        setSearchQuery('');
        setFilteredConditions([]);
        setDialogOpen(false);
    };
    const renderSelectedConditions = () => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 2 }}>
            {selectedConditions.map((condition) => (
                <Chip
                    key={condition}
                    label={condition}
                    onDelete={() => handleRemoveCondition(condition)}
                    variant='outlined'
                    sx={{ margin: 0.5 }}
                />
            ))}
        </Box>
    );

    const renderConditionDetails = () => (
        <Box sx={{ p: 2 }}>
            {selectedConditions.map((condition) => (
                <Card key={condition} sx={{ mb: 2 }}>
                    <CardContent>
                        <Typography variant='h6' gutterBottom>
                            {condition}
                        </Typography>
                        <Grid container spacing={2}>
                            {Object.entries(conditionsData[condition]).map(
                                ([method, values]) =>
                                    values.I && (
                                        <Grid item xs={12} key={method}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography variant='body1' sx={{ flex: 1 }}>
                                                    {method}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Box
                                                        sx={{
                                                            bgcolor: getColorForValue(values.I),
                                                            color: 'white',
                                                            px: 2,
                                                            py: 1,
                                                            borderRadius: 1,
                                                            minWidth: 120,
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        Initiation: {values.I}
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            bgcolor: getColorForValue(values.C),
                                                            color: 'white',
                                                            px: 2,
                                                            py: 1,
                                                            borderRadius: 1,
                                                            minWidth: 120,
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        Continuation: {values.C}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );

    const renderInfoBox = () => (
        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            {INFO_TEXTS.map((text, index) => (
                <Typography key={index} variant='body2' sx={{ mb: 1 }}>
                    {index + 1} = {text}
                </Typography>
            ))}
            <Typography variant='body2' sx={{ mb: 2 }}>
                source: US Medical Eligibility Criteria for Contraceptive Use
            </Typography>
            <Button variant="contained" onClick={() => window.open(PDF_URL, '_blank', 'noopener,noreferrer')}>
                View Summary Chart PDF
            </Button>
        </Paper>
    );

    return (
        <Container maxWidth='lg' sx={{ py: 4 }}>
            <Paper sx={{ mb: 2 }}>
                <Box sx={{ p: 2 }}>
                    <TextField
                        fullWidth
                        placeholder='Search conditions (min. 3 characters)'
                        value={searchQuery}
                        onChange={onChangeSearch}
                        variant='outlined'
                    />
                </Box>
                {renderSelectedConditions()}
            </Paper>

            {renderConditionDetails()}

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth='sm'
                disableEnforceFocus
                disableAutoFocus
                disableRestoreFocus
            >
                <List sx={{ p: 2 }}>
                    {filteredConditions.map((condition) => (
                        <ListItem key={condition} button onClick={() => handleSelectCondition(condition)}>
                            <ListItemText primary={condition} />
                        </ListItem>
                    ))}
                    {searchQuery.length > 0 && searchQuery.length < 3 && (
                        <ListItem>
                            <ListItemText
                                secondary='Type at least 3 characters to search'
                                sx={{ textAlign: 'center' }}
                            />
                        </ListItem>
                    )}
                </List>
            </Dialog>

            {renderInfoBox()}
        </Container>
    );
}
