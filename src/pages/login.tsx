import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { APIContext } from "@/contexts/apiContext";

export default function LoginPage() {
    const { login } = useContext(APIContext);

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

    const onSubmit = (values: z.infer<typeof loginFormSchema>) => {
        console.log(values);
    }

    return (
        <div className="flex justify-center items-center h-[100vh]">
            <Card className="border-0 sm:border">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to login</CardDescription>
                </CardHeader>
                <CardContent>
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
                            <Button className="mt-4 w-full" type="submit">Login</Button>
                            <p className="mt-1 text-sm">Don't have an account <Link className="font-bold underline text-blue-500" to={"/signup"}>Signup</Link></p>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}