export const SHEETS_MAPPING = {
    'a2z-sheet': 'Striver A2Z',
    'blind-75': 'Blind 75',
    'sde-sheet': 'Striver SDE Sheet',
    '79-last-moment': 'Striver 79 Last Moment DSA',
    'cp-sheet': 'Striver CP Sheet',
    'system-design': 'System Design Roadmap',
    'computer-networks': 'Computer Networks',
    'dbms': 'DBMS',
    'operating-system': 'Operating System',
    'byts-problems': 'Byts Problems'
};

export const SHEET_SLUGS = Object.keys(SHEETS_MAPPING);

export function getSheetName(slug: string): string | undefined {
    return SHEETS_MAPPING[slug as keyof typeof SHEETS_MAPPING];
}

export const NAV_LINKS = [
    { title: 'Byts Problems', slug: 'byts-problems' },
    { title: 'Striver A-Z Sheet', slug: 'a2z-sheet' },
    { title: 'Blind 75', slug: 'blind-75' },
    { title: 'SDE Sheet', slug: 'sde-sheet' },
    { title: '79 Last Moment', slug: '79-last-moment' },
    { title: 'CP Sheet', slug: 'cp-sheet' },
    { title: 'System Design', slug: 'system-design' },
    { title: 'Networks', slug: 'computer-networks' },
    { title: 'DBMS', slug: 'dbms' },
    { title: 'OS', slug: 'operating-system' },
];
