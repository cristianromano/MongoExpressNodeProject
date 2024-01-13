const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
    },

    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true, //quita los espacios en blanco al inicio y al final
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String], //arreglo de strings
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //no se muestra en el json
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// DOCUMENT MIDDLEWARE
// corre antes que el .save() y el .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// corre despues que el .save() y el .create()
// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
// corre antes de un .find() o un .findOne() o un .findOneAndUpdate() o un .findOneAndDelete()
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// tourSchema.post(/^find/, function (docs,next) {

//   next();
// });

// en el schema se puede agregar metodos que se pueden usar en el controlador o en el middleware
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
