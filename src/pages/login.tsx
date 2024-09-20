import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/apiContext";
import { ButtonLoader } from "@/components/ui/buttonLoader";
import { useState } from "react";

export default function LoginPage() {
    const { login } = useAuth();
    const redirect = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loginFormSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8).max(50),
    });

    const loginForm = useForm({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const onSubmit = async (values: z.infer<typeof loginFormSchema>) => {
        setError(null);
        setLoading(true);
        const loginRes = await login(values.email, values.password);
        setLoading(false);

        if (loginRes) {
            if (loginRes[0] && loginRes[0].code === "INVALID_CREDENTIALS") {
                setError("Incorrect email address or password");
                loginForm.setError("email", {
                    type: "manual",
                    message: "",
                });
                loginForm.setError("password", {
                    type: "manual",
                    message: "",
                });
            }
            return;
        }

        redirect("/friends");
    }

    return (
        <div className="flex justify-center items-center h-[100vh]">
            <Card className="border-0 sm:border">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to login</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive font-medium mb-2">{error}</p>
                    <Form {...loginForm} >
                        <form onSubmit={loginForm.handleSubmit(onSubmit)} className="w-96">
                            <FormField
                                control={loginForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your email address" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={loginForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="mt-4">
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Your ultra secret password" {...field} />
                                        </FormControl>
                                        <div className="flex justify-end">
                                            <Link className="text-xs font-bold text-gray-500 hover:text-black" to={"/forgotpassword"}>Forgot password</Link>
                                        </div>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <ButtonLoader loading={loading} loadingMsg="Logging in" className="mt-4 w-full" type="submit">Login</ButtonLoader>
                            <p className="mt-1 text-sm">Don't have an account <Link className="font-bold underline text-blue-500" to={"/signup"}>Signup</Link></p>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}