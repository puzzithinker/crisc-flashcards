export interface Card {
    id: number;
    term: string;
    definition: string;
}

export interface Progress {
    box: number;
    lastReviewed: number;
}

export type ReviewMode = 'full' | 'srs' | 'none';