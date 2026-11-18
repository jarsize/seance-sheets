// Sample dataset: haunted pumpkin-patch sales, Sep-Oct 2026.
// Same rows as data/sample-pumpkin-patch-sales.csv, embedded so the
// app works with zero upload. Revenue = Quantity * Unit Price.
const SAMPLE_COLUMNS = ["Date", "Product", "Quantity", "Unit Price", "Revenue", "Patch Location", "Weather"];
const SAMPLE_DATA = [
  {
    "Date": "2026-09-01",
    "Product": "Black Cat Squash",
    "Quantity": 8,
    "Unit Price": 9.0,
    "Revenue": 72.0,
    "Patch Location": "North Patch",
    "Weather": "Foggy"
  },
  {
    "Date": "2026-09-01",
    "Product": "Ghost Gourd",
    "Quantity": 15,
    "Unit Price": 8.5,
    "Revenue": 127.5,
    "Patch Location": "South Patch",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-09-02",
    "Product": "Black Cat Squash",
    "Quantity": 35,
    "Unit Price": 9.0,
    "Revenue": 315.0,
    "Patch Location": "North Patch",
    "Weather": "Windy"
  },
  {
    "Date": "2026-09-03",
    "Product": "Candy Corn (lbs)",
    "Quantity": 3,
    "Unit Price": 4.75,
    "Revenue": 14.25,
    "Patch Location": "North Patch",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-09-04",
    "Product": "Ghost Gourd",
    "Quantity": 15,
    "Unit Price": 8.5,
    "Revenue": 127.5,
    "Patch Location": "Raven's Roost",
    "Weather": "Windy"
  },
  {
    "Date": "2026-09-05",
    "Product": "Jack-o'-Lantern Pumpkin",
    "Quantity": 36,
    "Unit Price": 12.0,
    "Revenue": 432.0,
    "Patch Location": "South Patch",
    "Weather": "Windy"
  },
  {
    "Date": "2026-09-06",
    "Product": "Candy Corn (lbs)",
    "Quantity": 15,
    "Unit Price": 4.75,
    "Revenue": 71.25,
    "Patch Location": "Pumpkin Hollow",
    "Weather": "Windy"
  },
  {
    "Date": "2026-09-07",
    "Product": "Witch's Broom Corn",
    "Quantity": 1,
    "Unit Price": 6.25,
    "Revenue": 6.25,
    "Patch Location": "South Patch",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-09-08",
    "Product": "Witch's Broom Corn",
    "Quantity": 18,
    "Unit Price": 6.25,
    "Revenue": 112.5,
    "Patch Location": "South Patch",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-09-09",
    "Product": "Spooky Sunflower",
    "Quantity": 22,
    "Unit Price": 5.5,
    "Revenue": 121.0,
    "Patch Location": "North Patch",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-09-10",
    "Product": "Candy Corn (lbs)",
    "Quantity": 7,
    "Unit Price": 4.75,
    "Revenue": 33.25,
    "Patch Location": "Creepy Hollow",
    "Weather": "Foggy"
  },
  {
    "Date": "2026-09-11",
    "Product": "Haunted Hay Bale",
    "Quantity": 17,
    "Unit Price": 15.0,
    "Revenue": 255.0,
    "Patch Location": "North Patch",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-09-12",
    "Product": "Haunted Hay Bale",
    "Quantity": 8,
    "Unit Price": 15.0,
    "Revenue": 120.0,
    "Patch Location": "Pumpkin Hollow",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-09-13",
    "Product": "Haunted Hay Bale",
    "Quantity": 19,
    "Unit Price": 15.0,
    "Revenue": 285.0,
    "Patch Location": "Raven's Roost",
    "Weather": "Foggy"
  },
  {
    "Date": "2026-09-13",
    "Product": "Haunted Hay Bale",
    "Quantity": 13,
    "Unit Price": 15.0,
    "Revenue": 195.0,
    "Patch Location": "North Patch",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-09-14",
    "Product": "Black Cat Squash",
    "Quantity": 15,
    "Unit Price": 9.0,
    "Revenue": 135.0,
    "Patch Location": "Creepy Hollow",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-09-15",
    "Product": "Spooky Sunflower",
    "Quantity": 15,
    "Unit Price": 5.5,
    "Revenue": 82.5,
    "Patch Location": "North Patch",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-09-16",
    "Product": "Witch's Broom Corn",
    "Quantity": 30,
    "Unit Price": 6.25,
    "Revenue": 187.5,
    "Patch Location": "Creepy Hollow",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-09-17",
    "Product": "Witch's Broom Corn",
    "Quantity": 23,
    "Unit Price": 6.25,
    "Revenue": 143.75,
    "Patch Location": "South Patch",
    "Weather": "Foggy"
  },
  {
    "Date": "2026-09-18",
    "Product": "Black Cat Squash",
    "Quantity": 5,
    "Unit Price": 9.0,
    "Revenue": 45.0,
    "Patch Location": "Raven's Roost",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-09-19",
    "Product": "Haunted Hay Bale",
    "Quantity": 16,
    "Unit Price": 15.0,
    "Revenue": 240.0,
    "Patch Location": "South Patch",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-09-20",
    "Product": "Candy Corn (lbs)",
    "Quantity": 18,
    "Unit Price": 4.75,
    "Revenue": 85.5,
    "Patch Location": "Raven's Roost",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-09-21",
    "Product": "Black Cat Squash",
    "Quantity": 21,
    "Unit Price": 9.0,
    "Revenue": 189.0,
    "Patch Location": "North Patch",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-09-22",
    "Product": "Spooky Sunflower",
    "Quantity": 3,
    "Unit Price": 5.5,
    "Revenue": 16.5,
    "Patch Location": "Creepy Hollow",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-09-23",
    "Product": "Witch's Broom Corn",
    "Quantity": 5,
    "Unit Price": 6.25,
    "Revenue": 31.25,
    "Patch Location": "South Patch",
    "Weather": "Windy"
  },
  {
    "Date": "2026-09-24",
    "Product": "Black Cat Squash",
    "Quantity": 21,
    "Unit Price": 9.0,
    "Revenue": 189.0,
    "Patch Location": "South Patch",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-09-25",
    "Product": "Candy Corn (lbs)",
    "Quantity": 30,
    "Unit Price": 4.75,
    "Revenue": 142.5,
    "Patch Location": "South Patch",
    "Weather": "Foggy"
  },
  {
    "Date": "2026-09-25",
    "Product": "Ghost Gourd",
    "Quantity": 16,
    "Unit Price": 8.5,
    "Revenue": 136.0,
    "Patch Location": "Raven's Roost",
    "Weather": "Windy"
  },
  {
    "Date": "2026-09-26",
    "Product": "Witch's Broom Corn",
    "Quantity": 38,
    "Unit Price": 6.25,
    "Revenue": 237.5,
    "Patch Location": "Pumpkin Hollow",
    "Weather": "Windy"
  },
  {
    "Date": "2026-09-27",
    "Product": "Candy Corn (lbs)",
    "Quantity": 24,
    "Unit Price": 4.75,
    "Revenue": 114.0,
    "Patch Location": "South Patch",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-09-28",
    "Product": "Haunted Hay Bale",
    "Quantity": 32,
    "Unit Price": 15.0,
    "Revenue": 480.0,
    "Patch Location": "North Patch",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-09-29",
    "Product": "Spooky Sunflower",
    "Quantity": 8,
    "Unit Price": 5.5,
    "Revenue": 44.0,
    "Patch Location": "South Patch",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-09-30",
    "Product": "Spooky Sunflower",
    "Quantity": 28,
    "Unit Price": 5.5,
    "Revenue": 154.0,
    "Patch Location": "Raven's Roost",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-10-01",
    "Product": "Candy Corn (lbs)",
    "Quantity": 25,
    "Unit Price": 4.75,
    "Revenue": 118.75,
    "Patch Location": "Raven's Roost",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-10-02",
    "Product": "Haunted Hay Bale",
    "Quantity": 17,
    "Unit Price": 15.0,
    "Revenue": 255.0,
    "Patch Location": "Raven's Roost",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-10-03",
    "Product": "Black Cat Squash",
    "Quantity": 8,
    "Unit Price": 9.0,
    "Revenue": 72.0,
    "Patch Location": "Raven's Roost",
    "Weather": "Foggy"
  },
  {
    "Date": "2026-10-04",
    "Product": "Spooky Sunflower",
    "Quantity": 22,
    "Unit Price": 5.5,
    "Revenue": 121.0,
    "Patch Location": "North Patch",
    "Weather": "Foggy"
  },
  {
    "Date": "2026-10-05",
    "Product": "Candy Corn (lbs)",
    "Quantity": 11,
    "Unit Price": 4.75,
    "Revenue": 52.25,
    "Patch Location": "Pumpkin Hollow",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-10-06",
    "Product": "Black Cat Squash",
    "Quantity": 17,
    "Unit Price": 9.0,
    "Revenue": 153.0,
    "Patch Location": "Raven's Roost",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-10-07",
    "Product": "Haunted Hay Bale",
    "Quantity": 7,
    "Unit Price": 15.0,
    "Revenue": 105.0,
    "Patch Location": "Creepy Hollow",
    "Weather": "Windy"
  },
  {
    "Date": "2026-10-07",
    "Product": "Haunted Hay Bale",
    "Quantity": 13,
    "Unit Price": 15.0,
    "Revenue": 195.0,
    "Patch Location": "South Patch",
    "Weather": "Foggy"
  },
  {
    "Date": "2026-10-08",
    "Product": "Spooky Sunflower",
    "Quantity": 11,
    "Unit Price": 5.5,
    "Revenue": 60.5,
    "Patch Location": "Raven's Roost",
    "Weather": "Windy"
  },
  {
    "Date": "2026-10-09",
    "Product": "Jack-o'-Lantern Pumpkin",
    "Quantity": 39,
    "Unit Price": 12.0,
    "Revenue": 468.0,
    "Patch Location": "Creepy Hollow",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-10-10",
    "Product": "Jack-o'-Lantern Pumpkin",
    "Quantity": 8,
    "Unit Price": 12.0,
    "Revenue": 96.0,
    "Patch Location": "Creepy Hollow",
    "Weather": "Foggy"
  },
  {
    "Date": "2026-10-11",
    "Product": "Ghost Gourd",
    "Quantity": 4,
    "Unit Price": 8.5,
    "Revenue": 34.0,
    "Patch Location": "South Patch",
    "Weather": "Windy"
  },
  {
    "Date": "2026-10-12",
    "Product": "Jack-o'-Lantern Pumpkin",
    "Quantity": 6,
    "Unit Price": 12.0,
    "Revenue": 72.0,
    "Patch Location": "Pumpkin Hollow",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-10-13",
    "Product": "Spooky Sunflower",
    "Quantity": 35,
    "Unit Price": 5.5,
    "Revenue": 192.5,
    "Patch Location": "South Patch",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-10-14",
    "Product": "Black Cat Squash",
    "Quantity": 31,
    "Unit Price": 9.0,
    "Revenue": 279.0,
    "Patch Location": "Raven's Roost",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-10-15",
    "Product": "Witch's Broom Corn",
    "Quantity": 34,
    "Unit Price": 6.25,
    "Revenue": 212.5,
    "Patch Location": "Raven's Roost",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-10-16",
    "Product": "Ghost Gourd",
    "Quantity": 35,
    "Unit Price": 8.5,
    "Revenue": 297.5,
    "Patch Location": "South Patch",
    "Weather": "Foggy"
  },
  {
    "Date": "2026-10-17",
    "Product": "Candy Corn (lbs)",
    "Quantity": 24,
    "Unit Price": 4.75,
    "Revenue": 114.0,
    "Patch Location": "Pumpkin Hollow",
    "Weather": "Windy"
  },
  {
    "Date": "2026-10-18",
    "Product": "Candy Corn (lbs)",
    "Quantity": 8,
    "Unit Price": 4.75,
    "Revenue": 38.0,
    "Patch Location": "South Patch",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-10-19",
    "Product": "Jack-o'-Lantern Pumpkin",
    "Quantity": 22,
    "Unit Price": 12.0,
    "Revenue": 264.0,
    "Patch Location": "North Patch",
    "Weather": "Windy"
  },
  {
    "Date": "2026-10-19",
    "Product": "Haunted Hay Bale",
    "Quantity": 15,
    "Unit Price": 15.0,
    "Revenue": 225.0,
    "Patch Location": "Raven's Roost",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-10-20",
    "Product": "Jack-o'-Lantern Pumpkin",
    "Quantity": 5,
    "Unit Price": 12.0,
    "Revenue": 60.0,
    "Patch Location": "North Patch",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-10-21",
    "Product": "Jack-o'-Lantern Pumpkin",
    "Quantity": 3,
    "Unit Price": 12.0,
    "Revenue": 36.0,
    "Patch Location": "Creepy Hollow",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-10-22",
    "Product": "Haunted Hay Bale",
    "Quantity": 16,
    "Unit Price": 15.0,
    "Revenue": 240.0,
    "Patch Location": "Creepy Hollow",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-10-23",
    "Product": "Ghost Gourd",
    "Quantity": 35,
    "Unit Price": 8.5,
    "Revenue": 297.5,
    "Patch Location": "South Patch",
    "Weather": "Windy"
  },
  {
    "Date": "2026-10-24",
    "Product": "Haunted Hay Bale",
    "Quantity": 31,
    "Unit Price": 15.0,
    "Revenue": 465.0,
    "Patch Location": "South Patch",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-10-25",
    "Product": "Spooky Sunflower",
    "Quantity": 27,
    "Unit Price": 5.5,
    "Revenue": 148.5,
    "Patch Location": "South Patch",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-10-26",
    "Product": "Jack-o'-Lantern Pumpkin",
    "Quantity": 28,
    "Unit Price": 12.0,
    "Revenue": 336.0,
    "Patch Location": "Creepy Hollow",
    "Weather": "Rainy"
  },
  {
    "Date": "2026-10-27",
    "Product": "Candy Corn (lbs)",
    "Quantity": 30,
    "Unit Price": 4.75,
    "Revenue": 142.5,
    "Patch Location": "North Patch",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-10-28",
    "Product": "Jack-o'-Lantern Pumpkin",
    "Quantity": 26,
    "Unit Price": 12.0,
    "Revenue": 312.0,
    "Patch Location": "Creepy Hollow",
    "Weather": "Sunny"
  },
  {
    "Date": "2026-10-29",
    "Product": "Ghost Gourd",
    "Quantity": 13,
    "Unit Price": 8.5,
    "Revenue": 110.5,
    "Patch Location": "South Patch",
    "Weather": "Windy"
  },
  {
    "Date": "2026-10-30",
    "Product": "Candy Corn (lbs)",
    "Quantity": 9,
    "Unit Price": 4.75,
    "Revenue": 42.75,
    "Patch Location": "Pumpkin Hollow",
    "Weather": "Cloudy"
  },
  {
    "Date": "2026-10-31",
    "Product": "Witch's Broom Corn",
    "Quantity": 30,
    "Unit Price": 6.25,
    "Revenue": 187.5,
    "Patch Location": "South Patch",
    "Weather": "Sunny"
  }
];
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLE_COLUMNS, SAMPLE_DATA };
}
