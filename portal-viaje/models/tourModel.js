const mongoose = require("mongoose");
const slugify = require("slugify");
//const validator = require("validator");
//const User = require("./userModel");
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      maxlength: [40, "A tour name must have less or equal than 40 characters"],
      minlenght: [10, "A tour name must have more or equal than 10 characters"],
      // validate: [validator.isAlpha, "Tour name must only contain characters"],
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
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      // para que se redondee el numero a 1 decimal y no a 2 decimales como lo hace por defecto mongoose en el json de respuesta de la api rest (get all tours)
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },

    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // this only points to current doc on NEW document creation and not on update
        validator: function (val) {
          return val < this.price;
        },
      },
      message: "Discount price ({VALUE}) should be below regular price",
    },
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
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number], //arreglo de numeros
      address: String,
      description: String,
    },
    locations: [
      //GeoJSON
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number], //arreglo de numeros
        address: String,
        description: String,
        day: Number,
      },
    ],
    //guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    // para que los virtuals se muestren en el json
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// para que el campo price sea indexado en la base de datos
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

// Virtual populate
tourSchema.virtual("reviews", {
  // nombre del modelo
  ref: "Review",
  // referncia al campo tour del modelo review
  foreignField: "tour",
  // campo del modelo tour que se va a relacionar con el modelo review
  localField: "_id",
});

// en el schema se puede agregar metodos que se pueden usar en el controlador o en el middleware
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE
// corre antes que el .save() y el .create()
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// para embebido

// tourSchema.pre("save", async function (next) {
//   const guidesPromise = this.guides.map(async (id) => {
//     await User.findById(id);
//   });

//   // para que se ejecuten todas las promesas al mismo tiempo
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

// corre despues que el .save() y el .create()
// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });

  next();
});

// corre antes de un .find() o un .findOne() o un .findOneAndUpdate() o un .findOneAndDelete()
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// AGGREGATION MIDDLEWARE
// corre antes de un .aggregate()
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
