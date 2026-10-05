// Service d'Intelligence Artificielle pour les recommandations agricoles

export interface CropData {
  name: string;
  plantingWindow: { start: number; end: number }; // mois (1-12)
  harvestWindow: { start: number; end: number };
  waterRequirement: number; // mm/mois
  temperatureRange: { min: number; max: number }; // °C
  soilTypes: string[];
  diseases: string[];
  pests: string[];
}

export interface EnvironmentalData {
  temperature: number;
  humidity: number;
  rainfall: number;
  soilMoisture: number;
  ndvi: number;
  month: number;
  soilType: string;
}

export interface MarketData {
  crop: string;
  currentPrice: number;
  demandLevel: 'low' | 'medium' | 'high';
  seasonalTrend: 'increasing' | 'stable' | 'decreasing';
}

export class AIService {
  private static instance: AIService;
  
  // Base de connaissances pour la région de Sikensi
  private cropDatabase: CropData[] = [
    {
      name: 'Cacao',
      plantingWindow: { start: 3, end: 5 },
      harvestWindow: { start: 10, end: 2 },
      waterRequirement: 150,
      temperatureRange: { min: 24, max: 30 },
      soilTypes: ['Ferralsol', 'Acrisol'],
      diseases: ['Pourriture brune', 'Moniliose'],
      pests: ['Mirides', 'Foreurs']
    },
    {
      name: 'Palmier à huile',
      plantingWindow: { start: 4, end: 6 },
      harvestWindow: { start: 1, end: 12 },
      waterRequirement: 180,
      temperatureRange: { min: 26, max: 32 },
      soilTypes: ['Ferralsol', 'Gleysol'],
      diseases: ['Pourriture du cœur', 'Cercosporiose'],
      pests: ['Charançon', 'Chenilles défoliatrices']
    },
    {
      name: 'Hévéa',
      plantingWindow: { start: 3, end: 5 },
      harvestWindow: { start: 1, end: 12 },
      waterRequirement: 120,
      temperatureRange: { min: 25, max: 30 },
      soilTypes: ['Ferralsol', 'Acrisol'],
      diseases: ['Maladie sud-américaine', 'Anthracnose'],
      pests: ['Acariens', 'Cochenilles']
    },
    {
      name: 'Tomate',
      plantingWindow: { start: 10, end: 2 },
      harvestWindow: { start: 12, end: 4 },
      waterRequirement: 80,
      temperatureRange: { min: 20, max: 30 },
      soilTypes: ['Ferralsol', 'Fluvisol'],
      diseases: ['Mildiou', 'Flétrissement bactérien'],
      pests: ['Aleurodes', 'Nématodes']
    },
    {
      name: 'Manioc',
      plantingWindow: { start: 3, end: 7 },
      harvestWindow: { start: 12, end: 2 },
      waterRequirement: 60,
      temperatureRange: { min: 25, max: 35 },
      soilTypes: ['Ferralsol', 'Acrisol', 'Lixisol'],
      diseases: ['Mosaïque', 'Bactériose'],
      pests: ['Acariens verts', 'Cochenilles']
    }
  ];

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Algorithme de recommandation basé sur les conditions environnementales
  generateRecommendations(
    environmentalData: EnvironmentalData,
    marketData: MarketData[],
    userPreferences?: string[]
  ) {
    const recommendations = this.cropDatabase.map(crop => {
      const score = this.calculateCropScore(crop, environmentalData, marketData);
      const risks = this.assessRisks(crop, environmentalData);
      const optimalDates = this.calculateOptimalDates(crop, environmentalData);

      return {
        crop: crop.name,
        confidence: Math.round(score * 100),
        optimalPlantingDate: optimalDates.planting,
        expectedHarvest: optimalDates.harvest,
        riskLevel: this.categorizeRisk(risks.totalRisk),
        reasons: this.generateReasons(crop, environmentalData, score, risks),
        marketOutlook: this.getMarketOutlook(crop.name, marketData),
        expectedYield: this.predictYield(crop, environmentalData),
        profitability: this.calculateProfitability(crop, marketData)
      };
    });

    // Trier par score de confiance
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Top 5 recommandations
  }

  private calculateCropScore(
    crop: CropData,
    env: EnvironmentalData,
    marketData: MarketData[]
  ): number {
    let score = 0;
    let factors = 0;

    // Facteur climatique (40% du score)
    const climateScore = this.calculateClimateScore(crop, env);
    score += climateScore * 0.4;
    factors += 0.4;

    // Facteur saisonnier (30% du score)
    const seasonScore = this.calculateSeasonScore(crop, env.month);
    score += seasonScore * 0.3;
    factors += 0.3;

    // Facteur marché (20% du score)
    const marketScore = this.calculateMarketScore(crop.name, marketData);
    score += marketScore * 0.2;
    factors += 0.2;

    // Facteur NDVI/santé du sol (10% du score)
    const soilScore = Math.min(1, env.ndvi / 0.8); // NDVI optimal > 0.8
    score += soilScore * 0.1;
    factors += 0.1;

    return score / factors;
  }

  private calculateClimateScore(crop: CropData, env: EnvironmentalData): number {
    let score = 0;

    // Score température
    if (env.temperature >= crop.temperatureRange.min && 
        env.temperature <= crop.temperatureRange.max) {
      score += 0.4;
    } else {
      const tempDeviation = Math.min(
        Math.abs(env.temperature - crop.temperatureRange.min),
        Math.abs(env.temperature - crop.temperatureRange.max)
      );
      score += Math.max(0, 0.4 - (tempDeviation / 10) * 0.4);
    }

    // Score pluviométrie
    const rainfallRatio = env.rainfall / crop.waterRequirement;
    if (rainfallRatio >= 0.8 && rainfallRatio <= 1.2) {
      score += 0.3;
    } else {
      score += Math.max(0, 0.3 - Math.abs(rainfallRatio - 1) * 0.3);
    }

    // Score humidité
    const optimalHumidity = crop.waterRequirement > 100 ? 80 : 60;
    const humidityDeviation = Math.abs(env.humidity - optimalHumidity);
    score += Math.max(0, 0.3 - (humidityDeviation / 50) * 0.3);

    return score;
  }

  private calculateSeasonScore(crop: CropData, currentMonth: number): number {
    const { start, end } = crop.plantingWindow;
    
    if (start <= end) {
      // Fenêtre dans la même année
      return (currentMonth >= start && currentMonth <= end) ? 1 : 0;
    } else {
      // Fenêtre à cheval sur deux années
      return (currentMonth >= start || currentMonth <= end) ? 1 : 0;
    }
  }

  private calculateMarketScore(cropName: string, marketData: MarketData[]): number {
    const market = marketData.find(m => m.crop === cropName);
    if (!market) return 0.5; // Score neutre si pas de données

    let score = 0;
    
    // Score demande
    switch (market.demandLevel) {
      case 'high': score += 0.5; break;
      case 'medium': score += 0.3; break;
      case 'low': score += 0.1; break;
    }

    // Score tendance
    switch (market.seasonalTrend) {
      case 'increasing': score += 0.5; break;
      case 'stable': score += 0.3; break;
      case 'decreasing': score += 0.1; break;
    }

    return score;
  }

  private assessRisks(crop: CropData, env: EnvironmentalData) {
    const risks = {
      climate: 0,
      disease: 0,
      market: 0,
      totalRisk: 0
    };

    // Risque climatique
    if (env.temperature < crop.temperatureRange.min - 5 || 
        env.temperature > crop.temperatureRange.max + 5) {
      risks.climate += 0.3;
    }

    if (env.rainfall < crop.waterRequirement * 0.5) {
      risks.climate += 0.4;
    }

    // Risque de maladie (basé sur l'humidité)
    if (env.humidity > 85) {
      risks.disease += 0.3;
    }

    // Risque NDVI faible
    if (env.ndvi < 0.4) {
      risks.climate += 0.2;
    }

    risks.totalRisk = (risks.climate + risks.disease + risks.market) / 3;
    return risks;
  }

  private categorizeRisk(riskScore: number): 'low' | 'medium' | 'high' {
    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.6) return 'medium';
    return 'high';
  }

  private generateReasons(
    crop: CropData,
    env: EnvironmentalData,
    score: number,
    risks: any
  ): string[] {
    const reasons: string[] = [];

    if (env.temperature >= crop.temperatureRange.min && 
        env.temperature <= crop.temperatureRange.max) {
      reasons.push(`Température optimale (${env.temperature}°C)`);
    }

    if (env.rainfall >= crop.waterRequirement * 0.8) {
      reasons.push(`Pluviométrie suffisante (${env.rainfall}mm)`);
    }

    if (env.ndvi > 0.6) {
      reasons.push(`Bonne santé des sols (NDVI: ${env.ndvi})`);
    }

    if (risks.totalRisk < 0.3) {
      reasons.push('Faible risque climatique');
    }

    const seasonScore = this.calculateSeasonScore(crop, env.month);
    if (seasonScore > 0.8) {
      reasons.push('Période de plantation favorable');
    }

    return reasons;
  }

  private calculateOptimalDates(crop: CropData, env: EnvironmentalData) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Calculer la prochaine fenêtre de plantation
    let plantingMonth = crop.plantingWindow.start;
    if (currentMonth > crop.plantingWindow.end && crop.plantingWindow.start > crop.plantingWindow.end) {
      // Fenêtre de l'année suivante
      plantingMonth = crop.plantingWindow.start;
    } else if (currentMonth > crop.plantingWindow.end) {
      // Attendre l'année suivante
      plantingMonth = crop.plantingWindow.start;
    }

    const plantingDate = new Date(currentDate.getFullYear(), plantingMonth - 1, 15);
    if (plantingDate < currentDate) {
      plantingDate.setFullYear(plantingDate.getFullYear() + 1);
    }

    // Calculer la date de récolte
    const harvestDate = new Date(plantingDate);
    if (crop.harvestWindow.start >= crop.plantingWindow.start) {
      harvestDate.setMonth(crop.harvestWindow.start - 1);
    } else {
      harvestDate.setFullYear(harvestDate.getFullYear() + 1);
      harvestDate.setMonth(crop.harvestWindow.start - 1);
    }

    return {
      planting: plantingDate.toISOString(),
      harvest: harvestDate.toISOString()
    };
  }

  private getMarketOutlook(cropName: string, marketData: MarketData[]) {
    const market = marketData.find(m => m.crop === cropName);
    return market ? {
      demand: market.demandLevel,
      trend: market.seasonalTrend,
      price: market.currentPrice
    } : null;
  }

  private predictYield(crop: CropData, env: EnvironmentalData): number {
    // Modèle simplifié de prédiction de rendement
    const baseYield = this.getBaseYield(crop.name);
    const climateScore = this.calculateClimateScore(crop, env);
    const soilScore = Math.min(1, env.ndvi / 0.8);
    
    return Math.round(baseYield * (0.7 + 0.3 * climateScore) * (0.8 + 0.2 * soilScore));
  }

  private getBaseYield(cropName: string): number {
    const yields: { [key: string]: number } = {
      'Cacao': 800,
      'Palmier à huile': 3500,
      'Hévéa': 1800,
      'Tomate': 25000,
      'Manioc': 15000,
      'Piment': 8000,
      'Aubergine': 12000,
      'Banane': 20000
    };
    return yields[cropName] || 1000;
  }

  private calculateProfitability(crop: CropData, marketData: MarketData[]): number {
    const market = marketData.find(m => m.crop === crop.name);
    if (!market) return 0;

    const yield = this.getBaseYield(crop.name);
    const revenue = yield * market.currentPrice;
    const costs = this.estimateCosts(crop.name);
    
    return Math.round(((revenue - costs) / costs) * 100);
  }

  private estimateCosts(cropName: string): number {
    // Coûts estimés par hectare en FCFA
    const costs: { [key: string]: number } = {
      'Cacao': 500000,
      'Palmier à huile': 800000,
      'Hévéa': 600000,
      'Tomate': 300000,
      'Manioc': 150000,
      'Piment': 200000,
      'Aubergine': 250000,
      'Banane': 400000
    };
    return costs[cropName] || 200000;
  }
}

export default AIService;