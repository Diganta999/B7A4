import { Router } from "express";
import { AuthRoute } from "../modules/auth/auth.route";
import { UserRoute } from "../modules/user/user.route";
import { GearRoute } from "../modules/gear/gear.route";
import { CategoryRoute } from "../modules/category/category.route";


import { OrderRoute } from "../modules/order/order.route";
import { OrderItemRoute } from "../modules/orderItem/orderItem.route";
import { PaymentRoute } from "../modules/payment/payment.route";
import { ReviewRoute } from "../modules/review/review.route";
import { ProviderRoute } from "../modules/provider/provider.route";
import { AdminRoute } from "../modules/admin/admin.route";

const routes = Router();

const allRoute = [
    {
        path: "/auth",
        route: AuthRoute,
    },
    {
        path: "/users",
        route: UserRoute,
    },

    {
        path: "/gear",
        route: GearRoute,
    },

    {
        path: "/categories",
        route: CategoryRoute,
    },
    {
        path: "/orders",
        route: OrderRoute,
    },
    {
        path: "/rentals",
        route: OrderRoute,
    },
    {
        path: "/order-items",
        route: OrderItemRoute,
    },
    {
        path: "/payments",
        route: PaymentRoute,
    },
    {
        path: "/reviews",
        route: ReviewRoute,
    },
    {
        path: "/provider",
        route: ProviderRoute,
    },
    {
        path: "/admin",
        route: AdminRoute,
    },
];

allRoute.forEach((route) => {
    routes.use(route.path, route.route);
});

const Routes = routes;

export default Routes;
