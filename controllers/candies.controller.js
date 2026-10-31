import { asyncHandler } from "../utils/asyncHandler.js";

export class CandiesController {
  constructor(candiesService) {
    this.candiesService = candiesService;
  }

  list = asyncHandler(async (req, res) => {
    const candies = await this.candiesService.list();

    res.render("candy/list", { candies });
  });

  details = asyncHandler(async (req, res) => {
    const candyId = Number(req.params.id);

    const candy = await this.candiesService.read(candyId);

    res.render("candy/details", { candy });
  });

  edit = asyncHandler(async (req, res) => {
    const candyId = Number(req.params.id);
    const payload = req.body;

    const updatedCandy = await this.candiesService.update(candyId, payload);

    res.redirect("/doces/" + updatedCandy.id);
  });

  delete = asyncHandler(async (req, res) => {
    const candyId = Number(req.params.id);

    await this.candiesService.delete(candyId);

    res.redirect("/doces");
  });

  create = asyncHandler(async (req, res) => {
    const payload = req.body;

    const newCandy = await this.candiesService.create(payload);

    res.redirect("/doces/" + newCandy.id);
  });

  form = asyncHandler(async (req, res) => {
    res.render("candy/form");
  });
}
