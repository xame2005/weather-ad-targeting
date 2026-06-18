import type { StateDefinition } from "./types";

type PointInput = [name: string, lat: number, lng: number];

function state(
  abbrev: string,
  name: string,
  fips: string,
  points: PointInput[],
): StateDefinition {
  return {
    abbrev,
    name,
    fips,
    points: points.map(([pointName, latitude, longitude]) => ({
      name: pointName,
      latitude,
      longitude,
    })),
  };
}

export const US_STATES: StateDefinition[] = [
  state("AL", "Alabama", "01", [
    ["Montgomery", 32.3668, -86.3],
    ["Birmingham", 33.5207, -86.8025],
    ["Mobile", 30.6954, -88.0399],
  ]),
  state("AK", "Alaska", "02", [
    ["Juneau", 58.3019, -134.4197],
    ["Anchorage", 61.2181, -149.9003],
    ["Fairbanks", 64.8378, -147.7164],
  ]),
  state("AZ", "Arizona", "04", [
    ["Phoenix", 33.4484, -112.074],
    ["Tucson", 32.2226, -110.9747],
    ["Flagstaff", 35.1983, -111.6513],
  ]),
  state("AR", "Arkansas", "05", [
    ["Little Rock", 34.7465, -92.2896],
    ["Fayetteville", 36.0822, -94.1719],
    ["Jonesboro", 35.8423, -90.7043],
  ]),
  state("CA", "California", "06", [
    ["Sacramento", 38.5816, -121.4944],
    ["Los Angeles", 34.0522, -118.2437],
    ["San Francisco", 37.7749, -122.4194],
    ["San Diego", 32.7157, -117.1611],
  ]),
  state("CO", "Colorado", "08", [
    ["Denver", 39.7392, -104.9903],
    ["Colorado Springs", 38.8339, -104.8214],
    ["Grand Junction", 39.0639, -108.5506],
  ]),
  state("CT", "Connecticut", "09", [
    ["Hartford", 41.7658, -72.6734],
    ["New Haven", 41.3083, -72.9279],
    ["Stamford", 41.0534, -73.5387],
  ]),
  state("DE", "Delaware", "10", [
    ["Dover", 39.1582, -75.5244],
    ["Wilmington", 39.7391, -75.5398],
  ]),
  state("DC", "District of Columbia", "11", [
    ["Washington", 38.9072, -77.0369],
  ]),
  state("FL", "Florida", "12", [
    ["Tallahassee", 30.4383, -84.2807],
    ["Miami", 25.7617, -80.1918],
    ["Orlando", 28.5383, -81.3792],
    ["Jacksonville", 30.3322, -81.6557],
  ]),
  state("GA", "Georgia", "13", [
    ["Atlanta", 33.749, -84.388],
    ["Savannah", 32.0809, -81.0912],
    ["Augusta", 33.4735, -82.0105],
  ]),
  state("HI", "Hawaii", "15", [
    ["Honolulu", 21.3069, -157.8583],
    ["Hilo", 19.7074, -155.0885],
  ]),
  state("ID", "Idaho", "16", [
    ["Boise", 43.615, -116.2023],
    ["Idaho Falls", 43.4917, -112.0339],
    ["Coeur d'Alene", 47.6777, -116.7805],
  ]),
  state("IL", "Illinois", "17", [
    ["Springfield", 39.7817, -89.6501],
    ["Chicago", 41.8781, -87.6298],
    ["Rockford", 42.2711, -89.094],
  ]),
  state("IN", "Indiana", "18", [
    ["Indianapolis", 39.7684, -86.1581],
    ["Fort Wayne", 41.0793, -85.1394],
    ["Evansville", 37.9716, -87.5711],
  ]),
  state("IA", "Iowa", "19", [
    ["Des Moines", 41.5868, -93.625],
    ["Cedar Rapids", 41.9779, -91.6656],
    ["Sioux City", 42.499, -96.4003],
  ]),
  state("KS", "Kansas", "20", [
    ["Topeka", 39.0473, -95.6752],
    ["Wichita", 37.6872, -97.3301],
    ["Dodge City", 37.7528, -100.0171],
  ]),
  state("KY", "Kentucky", "21", [
    ["Frankfort", 38.2009, -84.8733],
    ["Louisville", 38.2527, -85.7585],
    ["Lexington", 38.0406, -84.5037],
  ]),
  state("LA", "Louisiana", "22", [
    ["Baton Rouge", 30.4515, -91.1871],
    ["New Orleans", 29.9511, -90.0715],
    ["Shreveport", 32.5252, -93.7502],
  ]),
  state("ME", "Maine", "23", [
    ["Augusta", 44.3106, -69.7795],
    ["Portland", 43.6591, -70.2568],
    ["Bangor", 44.8012, -68.7778],
  ]),
  state("MD", "Maryland", "24", [
    ["Annapolis", 38.9784, -76.4922],
    ["Baltimore", 39.2904, -76.6122],
  ]),
  state("MA", "Massachusetts", "25", [
    ["Boston", 42.3601, -71.0589],
    ["Worcester", 42.2626, -71.8023],
    ["Springfield", 42.1015, -72.5898],
  ]),
  state("MI", "Michigan", "26", [
    ["Lansing", 42.7325, -84.5555],
    ["Detroit", 42.3314, -83.0458],
    ["Marquette", 46.5436, -87.3954],
  ]),
  state("MN", "Minnesota", "27", [
    ["Saint Paul", 44.9537, -93.09],
    ["Minneapolis", 44.9778, -93.265],
    ["Duluth", 46.7867, -92.1005],
  ]),
  state("MS", "Mississippi", "28", [
    ["Jackson", 32.2988, -90.1848],
    ["Gulfport", 30.3674, -89.0928],
    ["Tupelo", 34.2576, -88.7034],
  ]),
  state("MO", "Missouri", "29", [
    ["Jefferson City", 38.5767, -92.1735],
    ["Kansas City", 39.0997, -94.5786],
    ["Springfield", 37.209, -93.2923],
  ]),
  state("MT", "Montana", "30", [
    ["Helena", 46.5891, -112.0391],
    ["Billings", 45.7833, -108.5007],
    ["Missoula", 46.8721, -114.0109],
  ]),
  state("NE", "Nebraska", "31", [
    ["Lincoln", 40.8258, -96.6852],
    ["Omaha", 41.2565, -95.9345],
    ["North Platte", 41.1403, -100.7601],
  ]),
  state("NV", "Nevada", "32", [
    ["Carson City", 39.1638, -119.7674],
    ["Las Vegas", 36.1699, -115.1398],
    ["Reno", 39.5296, -119.8138],
  ]),
  state("NH", "New Hampshire", "33", [
    ["Concord", 43.2081, -71.5376],
    ["Manchester", 42.9956, -71.4548],
  ]),
  state("NJ", "New Jersey", "34", [
    ["Trenton", 40.2206, -74.7597],
    ["Newark", 40.7357, -74.1724],
    ["Atlantic City", 39.3643, -74.4229],
  ]),
  state("NM", "New Mexico", "35", [
    ["Santa Fe", 35.687, -105.9378],
    ["Albuquerque", 35.0844, -106.6504],
    ["Las Cruces", 32.3199, -106.7637],
  ]),
  state("NY", "New York", "36", [
    ["Albany", 42.6526, -73.7562],
    ["New York City", 40.7128, -74.006],
    ["Buffalo", 42.8864, -78.8784],
  ]),
  state("NC", "North Carolina", "37", [
    ["Raleigh", 35.7796, -78.6382],
    ["Charlotte", 35.2271, -80.8431],
    ["Asheville", 35.5951, -82.5515],
  ]),
  state("ND", "North Dakota", "38", [
    ["Bismarck", 46.8083, -100.7837],
    ["Fargo", 46.8772, -96.7898],
  ]),
  state("OH", "Ohio", "39", [
    ["Columbus", 39.9612, -82.9988],
    ["Cleveland", 41.4993, -81.6944],
    ["Cincinnati", 39.1031, -84.512],
  ]),
  state("OK", "Oklahoma", "40", [
    ["Oklahoma City", 35.4676, -97.5164],
    ["Tulsa", 36.154, -95.9928],
    ["Lawton", 34.6036, -98.3959],
  ]),
  state("OR", "Oregon", "41", [
    ["Salem", 44.9429, -123.0351],
    ["Portland", 45.5152, -122.6784],
    ["Bend", 44.0582, -121.3153],
  ]),
  state("PA", "Pennsylvania", "42", [
    ["Harrisburg", 40.2732, -76.8867],
    ["Philadelphia", 39.9526, -75.1652],
    ["Pittsburgh", 40.4406, -79.9959],
  ]),
  state("RI", "Rhode Island", "44", [
    ["Providence", 41.824, -71.4128],
  ]),
  state("SC", "South Carolina", "45", [
    ["Columbia", 34.0007, -81.0348],
    ["Charleston", 32.7765, -79.9311],
    ["Greenville", 34.8526, -82.394],
  ]),
  state("SD", "South Dakota", "46", [
    ["Pierre", 44.3683, -100.351],
    ["Sioux Falls", 43.546, -96.7313],
    ["Rapid City", 44.0805, -103.231],
  ]),
  state("TN", "Tennessee", "47", [
    ["Nashville", 36.1627, -86.7816],
    ["Memphis", 35.1495, -90.049],
    ["Knoxville", 35.9606, -83.9207],
  ]),
  state("TX", "Texas", "48", [
    ["Austin", 30.2672, -97.7431],
    ["Houston", 29.7604, -95.3698],
    ["Dallas", 32.7767, -96.797],
    ["El Paso", 31.7619, -106.485],
  ]),
  state("UT", "Utah", "49", [
    ["Salt Lake City", 40.7608, -111.891],
    ["St. George", 37.0965, -113.5684],
    ["Logan", 41.737, -111.8338],
  ]),
  state("VT", "Vermont", "50", [
    ["Montpelier", 44.2601, -72.5754],
    ["Burlington", 44.4759, -73.2121],
  ]),
  state("VA", "Virginia", "51", [
    ["Richmond", 37.5407, -77.436],
    ["Virginia Beach", 36.8529, -75.978],
    ["Roanoke", 37.271, -79.9414],
  ]),
  state("WA", "Washington", "53", [
    ["Olympia", 47.0379, -122.9007],
    ["Seattle", 47.6062, -122.3321],
    ["Spokane", 47.6588, -117.426],
  ]),
  state("WV", "West Virginia", "54", [
    ["Charleston", 38.3498, -81.6326],
    ["Morgantown", 39.6295, -79.9559],
  ]),
  state("WI", "Wisconsin", "55", [
    ["Madison", 43.0731, -89.4012],
    ["Milwaukee", 43.0389, -87.9065],
    ["Green Bay", 44.5133, -88.0133],
  ]),
  state("WY", "Wyoming", "56", [
    ["Cheyenne", 41.14, -104.8202],
    ["Casper", 42.8666, -106.3131],
    ["Jackson", 43.4799, -110.7624],
  ]),
];

export const STATE_BY_ABBREV = Object.fromEntries(
  US_STATES.map((s) => [s.abbrev, s]),
);

export function getAllSamplePoints() {
  return US_STATES.flatMap((stateDef) =>
    stateDef.points.map((point) => ({
      stateAbbrev: stateDef.abbrev,
      stateName: stateDef.name,
      fips: stateDef.fips,
      ...point,
    })),
  );
}
