// utils.js
export const getColorForValue = (value) => {
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

export const INFO_TEXTS = [
    'A condition for which there is no restriction for the use of the contraceptive method',
    'A condition for which the advantages of using the method generally outweigh the theoretical or proven risks',
    'A condition for which the theoretical or proven risks usually outweigh the advantages of using the method',
    'A condition that represents an unacceptable health risk if the contraceptive method is used',
];

export const PDF_URL =
    'https://github.com/Atomic-Lemur/us-medical-eligibility-criteria-for-contraceptive-use/blob/main/assets/summary_chart.pdf?raw=true';
